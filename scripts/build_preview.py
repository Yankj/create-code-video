#!/usr/bin/env python3
"""Build a GIF from a real export; verify timing, pixel fidelity and provenance.
Requires ffmpeg/ffprobe and Pillow. --check needs Pillow, no source MP4.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def source_inputs():
    return [*sorted((ROOT/'examples/remotion-motion-lab/src').glob('*')),
            ROOT/'examples/remotion-motion-lab/package-lock.json',
            ROOT/'examples/remotion-motion-lab/remotion.config.ts', Path(__file__).resolve()]


def image_info(path):
    with Image.open(path) as image:
        size = image.size
        loop = image.info.get('loop')
        durations = []
        for i in range(image.n_frames):
            image.seek(i)
            durations.append(image.info.get('duration', 0))
        return dict(width=size[0], height=size[1], frames=len(durations),
                    duration_ms=sum(durations), loop=loop, durations_ms=durations)


def check(report_path):
    report = json.loads(Path(report_path).read_text(encoding='utf-8'))
    gif = ROOT / report['preview']
    if digest(gif) != report['preview_sha256']:
        raise ValueError('Preview checksum differs: rebuild from the verified export')
    measured = image_info(gif)
    if measured != report['gif'] or measured['loop'] != 0:
        raise ValueError('Preview geometry, frames, timing or loop differs')
    current = {str(p.relative_to(ROOT)) for p in source_inputs() if p.is_file()}
    if current != set(report['source_files_sha256']):
        raise ValueError('Source input set changed: preview must be rebuilt')
    for name, sha in report['source_files_sha256'].items():
        if digest(ROOT / name) != sha:
            raise ValueError(f'{name} changed: preview must be rebuilt')
    print(f"Preview verified: {measured['width']}×{measured['height']}, "
          f"{measured['frames']} frames, {measured['duration_ms']/1000:g}s, current source hashes")
    return report


def build(source, target, report_path, width, fps):
    if 100 % fps:
        raise ValueError('Choose an integer GIF fps dividing 100 (centisecond timing)')
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height:format=duration', '-of', 'json', str(source)]))
    stream = meta['streams'][0]
    duration = float(meta['format']['duration'])
    height = round(width * stream['height'] / stream['width'])
    target.parent.mkdir(parents=True, exist_ok=True)
    base = f'fps={fps},scale={width}:{height}:flags=lanczos'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-vf', base+
        ',split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3',
        '-loop', '0', str(target)], check=True)
    info = image_info(target)
    if (info['width'], info['height']) != (width, height) or abs(info['duration_ms']/1000-duration) > .1:
        raise ValueError('Preview aspect or duration differs from source')
    if any(d != 1000//fps for d in info['durations_ms']):
        raise ValueError('GIF frame timing is inconsistent')
    # Decode the SAME fps/scale filter and compare every GIF frame, not a poster.
    proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(source), '-vf', base,
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    errors = []
    try:
        with Image.open(target) as gif:
            for i in range(info['frames']):
                data = proc.stdout.read(width*height*3)
                if len(data) != width*height*3:
                    raise ValueError('Preview contains frames absent from source')
                reference = Image.frombytes('RGB', (width, height), data)
                gif.seek(i)
                diff = ImageChops.difference(reference, gif.convert('RGB'))
                errors.append(sum(ImageStat.Stat(diff).mean)/3)
            if proc.stdout.read(1):
                raise ValueError('Preview is missing source frames')
        stderr = proc.stderr.read().decode()
        if proc.wait() != 0:
            raise ValueError(stderr)
    finally:
        if proc.poll() is None:
            proc.kill()
        proc.stdout.close()
        proc.stderr.close()
    if max(errors) > 8:
        raise ValueError(f'Preview pixel difference exceeds palette tolerance: {max(errors):.2f}')
    inputs = source_inputs()
    report = dict(preview=str(target.resolve().relative_to(ROOT)), preview_sha256=digest(target),
        source=str(source.resolve().relative_to(ROOT)), source_sha256=digest(source),
        source_files_sha256={str(p.relative_to(ROOT)):digest(p) for p in inputs if p.is_file()},
        gif=info, source_dimensions=[stream['width'], stream['height']], source_duration=duration,
        fps=fps, comparison=dict(frames=len(errors), mean_absolute_rgb_error_max=round(max(errors),4),
            mean_absolute_rgb_error_mean=round(sum(errors)/len(errors),4), palette_tolerance=8),
        note='Pixel comparison verifies conversion fidelity; rendered layout and visual QA are separate checks.')
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    return check(report_path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', nargs='?', type=Path)
    parser.add_argument('target', nargs='?', type=Path)
    parser.add_argument('--report', type=Path, default=ROOT/'assets/motion-lab-preview.json')
    parser.add_argument('--width', type=int, default=360)
    parser.add_argument('--fps', type=int, default=10)
    parser.add_argument('--check', type=Path)
    args = parser.parse_args()
    if args.check:
        check(args.check)
    elif args.source and args.target:
        build(args.source, args.target, args.report, args.width, args.fps)
    else:
        parser.error('Provide source MP4 and target GIF, or --check report.json')


if __name__ == '__main__':
    main()
