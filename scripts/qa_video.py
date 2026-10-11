#!/usr/bin/env python3
"""Probe and fully decode a video; optionally compare specs and measure audio.

Requires ffmpeg and ffprobe. Does not judge images, continuity or listening quality.
"""
import argparse
import json
import math
import shutil
import subprocess
import sys
from fractions import Fraction
from pathlib import Path


def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)


def inspect(path, width=None, height=None, fps=None, duration=None, loudness=False):
    for cmd in ('ffmpeg', 'ffprobe'):
        if not shutil.which(cmd):
            raise ValueError(f'{cmd} is required')
    if not path.is_file():
        raise ValueError('Video file not found')
    probe = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)]).stdout)
    streams = probe.get('streams', [])
    videos = [s for s in streams if s.get('codec_type') == 'video']
    if not videos:
        raise ValueError('No video stream')
    v = videos[0]
    actual_fps = float(Fraction(v.get('avg_frame_rate', '0/1')))
    actual_duration = float(v.get('duration') or probe.get('format', {}).get('duration', 0))
    if not all(math.isfinite(n) and n > 0 for n in (actual_fps, actual_duration)):
        raise ValueError('Positive finite frame rate and duration required')
    actual = {'width': v['width'], 'height': v['height'], 'fps': actual_fps,
              'duration': actual_duration, 'videoCodec': v.get('codec_name'),
              'pixelFormat': v.get('pix_fmt'), 'frames': v.get('nb_frames'),
              'audio': [{k: s.get(k) for k in ('codec_name', 'sample_rate', 'channels', 'duration')}
                        for s in streams if s.get('codec_type') == 'audio']}
    errors = []
    for key, expected in [('width', width), ('height', height), ('fps', fps), ('duration', duration)]:
        if expected is not None:
            tolerance = 1.0 / actual_fps + 0.002 if key == 'duration' else 0.001
            if abs(actual[key] - expected) > tolerance:
                errors.append(f'{key}: expected {expected}, got {actual[key]}')
    decoded = run(['ffmpeg', '-v', 'error', '-xerror', '-nostdin', '-i', str(path),
                   '-map', '0:v:0', '-map', '0:a?', '-f', 'null', '-'])
    if decoded.stderr.strip():
        errors.append(decoded.stderr.strip())
    result = {'passed': not errors, 'actual': actual, 'fullDecode': not decoded.stderr.strip(),
              'errors': errors, 'limitations': ['Visual quality not automatically verified',
                                                'Audio not listened to']}
    if loudness and actual['audio']:
        measured = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(path), '-map', '0:a:0',
                        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'])
        start, end = measured.stderr.rfind('{'), measured.stderr.rfind('}')
        result['loudness'] = json.loads(measured.stderr[start:end+1])
    return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('video', type=Path)
    p.add_argument('--width', type=int)
    p.add_argument('--height', type=int)
    p.add_argument('--fps', type=float)
    p.add_argument('--duration', type=float)
    p.add_argument('--loudness', action='store_true')
    p.add_argument('--out', type=Path)
    args = p.parse_args()
    try:
        for name in ('width', 'height', 'fps', 'duration'):
            val = getattr(args, name)
            if val is not None and (not math.isfinite(val) or val <= 0):
                raise ValueError(f'{name} must be positive and finite')
        result = inspect(args.video, args.width, args.height, args.fps, args.duration, args.loudness)
    except (OSError, ValueError, subprocess.CalledProcessError, ZeroDivisionError) as e:
        result = {'passed': False, 'errors': [e.stderr.strip() if isinstance(e, subprocess.CalledProcessError) else str(e)]}
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(rendered, encoding='utf-8')
    sys.stdout.write(rendered)
    return int(not result['passed'])


if __name__ == '__main__':
    raise SystemExit(main())
