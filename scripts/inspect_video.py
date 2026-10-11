#!/usr/bin/env python3
"""Probe a local video and make timestamped frames/contact sheet.

Requires ffmpeg, ffprobe and Pillow. Never edits the source video.
Examples:
  python inspect_video.py input.mp4 --out /tmp/video-full --count 12
  python inspect_video.py input.mp4 --out /tmp/video-detail \
    --crop 512:288:0:354 --times 2,3,6,8,12,16,20,26,32,36
  python inspect_video.py output.mp4 --out /tmp/video-qa \
    --start 8 --end 10 --every 0.25

Crop is WIDTH:HEIGHT:X:Y in displayed pixels after FFmpeg autorotation.
Outputs: raw PNG frames, contact.jpg, probe.json. Open contact.jpg to inspect.
This does not listen to audio or validate continuous playback.
"""

import argparse
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def run(command):
    return subprocess.run(command, check=True, capture_output=True, text=True)


def display_size(stream):
    width, height = int(stream['width']), int(stream['height'])
    rotation = stream.get('tags', {}).get('rotate', 0)
    for entry in stream.get('side_data_list', []):
        if 'rotation' in entry:
            rotation = entry['rotation']
    if abs(round(float(rotation))) % 180 == 90:
        width, height = height, width
    return width, height


def crop_values(value, width, height):
    parts = value.split(':')
    if len(parts) != 4:
        raise ValueError('Crop must be WIDTH:HEIGHT:X:Y with integer pixels')
    w, h, x, y = (int(part) for part in parts)
    if w <= 0 or h <= 0 or x < 0 or y < 0 or x + w > width or y + h > height:
        raise ValueError(f'Crop exceeds displayed video bounds {width}x{height}')
    return w, h, x, y


def sample_times(args, duration):
    if args.times:
        times = [float(value.strip()) for value in args.times.split(',')]
    else:
        # Avoid asking for a frame exactly beyond the last decoded sample.
        end = min(duration - min(0.1, duration / 10), args.end if args.end is not None else duration)
        start = args.start
        if not math.isfinite(start) or not math.isfinite(end) or not 0 <= start <= end:
            raise ValueError('Start/end must define a range inside the video')
        if args.every is not None:
            if not math.isfinite(args.every) or args.every <= 0:
                raise ValueError('--every must be a positive finite number')
            count = math.floor((end - start) / args.every) + 1
            if count > 64:
                raise ValueError('More than 64 frames requested; shorten the range or increase --every')
            times = [start + i * args.every for i in range(count)]
        else:
            if not 1 <= args.count <= 64:
                raise ValueError('--count must be between 1 and 64')
            times = [start + (end - start) * i / max(1, args.count - 1) for i in range(args.count)]
    if not 1 <= len(times) <= 64 or any(not math.isfinite(t) or t < 0 or t >= duration for t in times):
        raise ValueError('Request 1–64 finite timestamps, each within [0, duration)')
    return times


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('video', type=Path)
    parser.add_argument('--out', type=Path, required=True, help='New or empty output directory')
    parser.add_argument('--crop', help='WIDTH:HEIGHT:X:Y; leave unset for full recording')
    parser.add_argument('--times', help='Comma-separated timestamps in seconds')
    parser.add_argument('--start', type=float, default=0)
    parser.add_argument('--end', type=float)
    sampling = parser.add_mutually_exclusive_group()
    sampling.add_argument('--count', type=int, default=12)
    sampling.add_argument('--every', type=float)
    parser.add_argument('--columns', type=int, default=3)
    parser.add_argument('--thumb-width', type=int, default=400)
    args = parser.parse_args()

    video = args.video.resolve()
    out = args.out.resolve()
    if not video.is_file():
        raise ValueError(f'Video file does not exist: {video}')
    for executable in ('ffmpeg', 'ffprobe'):
        if not shutil.which(executable):
            raise ValueError(f'{executable} is required')
    if out.exists() and (not out.is_dir() or any(out.iterdir())):
        raise ValueError('Output directory must be new or empty; existing files are never overwritten')
    if not 1 <= args.columns <= 8 or not 100 <= args.thumb_width <= 1200:
        raise ValueError('Use 1–8 columns and a thumbnail width of 100–1200 pixels')

    probe = json.loads(run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(video)]).stdout)
    streams = [stream for stream in probe['streams'] if stream.get('codec_type') == 'video']
    if not streams:
        raise ValueError('No video stream found')
    duration = float(streams[0].get('duration') or probe.get('format', {}).get('duration') or 0)
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError('A positive finite video duration is required')
    width, height = display_size(streams[0])
    crop = crop_values(args.crop, width, height) if args.crop else None
    times = sample_times(args, duration)
    out.mkdir(parents=True, exist_ok=True)

    images = []
    frame_names = []
    for index, timestamp in enumerate(times):
        target = out / f'frame_{index:03d}.png'
        command = ['ffmpeg', '-v', 'error', '-nostdin', '-ss', f'{timestamp:.6f}', '-i', str(video), '-map', '0:v:0']
        if crop:
            command += ['-vf', 'crop=' + ':'.join(map(str, crop))]
        command += ['-frames:v', '1', '-threads', '1', str(target)]
        run(command)
        with Image.open(target) as source:
            rgb = source.convert('RGB')
            thumb_height = max(1, round(rgb.height * args.thumb_width / rgb.width))
            images.append(rgb.resize((args.thumb_width, thumb_height), Image.Resampling.LANCZOS))
        frame_names.append(target.name)

    gap, label_height = 12, 28
    columns = min(args.columns, len(images))
    rows = math.ceil(len(images) / columns)
    cell_height = images[0].height + label_height
    sheet = Image.new('RGB', (columns * (args.thumb_width + gap) + gap, rows * (cell_height + gap) + gap), '#202020')
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for i, thumbnail in enumerate(images):
        x = gap + i % columns * (args.thumb_width + gap)
        y = gap + i // columns * (cell_height + gap)
        draw.text((x + 4, y + 5), f'{times[i]:07.3f}s', font=font, fill='white')
        sheet.paste(thumbnail, (x, y + label_height))
    sheet.save(out / 'contact.jpg', quality=93)
    manifest = {
        'source': str(video), 'duration': duration, 'display_width': width, 'display_height': height,
        'crop': crop, 'times': times, 'frames': frame_names, 'probe': probe,
        'limitations': ['Audio not listened to', 'Sampled frames do not verify continuous motion'],
    }
    (out / 'probe.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'contact': str(out / 'contact.jpg'), 'metadata': str(out / 'probe.json'), 'frames': len(images),
                      'duration': duration, 'display_size': [width, height], 'has_audio': any(
                          s.get('codec_type') == 'audio' for s in probe['streams'])}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        detail = error.stderr.strip() if isinstance(error, subprocess.CalledProcessError) else str(error)
        print(f'Error: {detail}', file=sys.stderr)
        sys.exit(1)
