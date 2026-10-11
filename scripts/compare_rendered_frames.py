#!/usr/bin/env python3
"""Compare sampled encoded frames with independently rendered stills.
Detects persistent-render state bugs that fresh stills and decoding miss.
Needs ffmpeg and Pillow; thresholds are configurable 8-bit RGB MAE.
"""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageChops, ImageStat


def mae(first, second):
    return sum(ImageStat.Stat(ImageChops.difference(first, second)).mean)/3


def compare(video, capture_report, global_limit=5, visual_limit=6):
    data = json.loads(capture_report.read_text(encoding='utf-8'))
    if not data.get('sameFrameAfterScrambledRequests') or not data.get('measurements'):
        raise ValueError('Use the successful font-ready render-check report')
    samples = []
    seen = set()
    with tempfile.TemporaryDirectory() as directory:
        for item in data['measurements']:
            # Compare the same export size. 720 output is a separate layout check.
            if item['exportSize'] != [1080, 1920] or item['frame'] in seen:
                continue
            seen.add(item['frame'])
            still_path = capture_report.parent / (item['name']+'.png')
            with Image.open(still_path) as image:
                still = image.convert('RGB')
            encoded_path = Path(directory)/'frame.png'
            subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-vf',
                f"select=eq(n\\,{item['frame']}),scale={still.width}:{still.height}:flags=lanczos",
                '-frames:v','1',str(encoded_path)], check=True)
            with Image.open(encoded_path) as image:
                encoded = image.convert('RGB')
            if encoded.size != still.size:
                raise ValueError('Encoded/still dimensions differ')
            # The named viewport makes the regression sensitive to sparse GPU
            # graphics that occupy only a small part of the entire frame.
            # This demo reserves y=530..1110 in its 1080×1920 design plane.
            scale = still.width/1080
            roi = (0, round(530*scale), still.width, round(1110*scale))
            whole = mae(still, encoded)
            visual = mae(still.crop(roi), encoded.crop(roi))
            samples.append(dict(frame=item['frame'], name=item['name'],
                mean_absolute_rgb_error=round(whole,4), visual_error=round(visual,4),
                passed=whole<=global_limit and visual<=visual_limit))
    if not samples:
        raise ValueError('No matching full-size captures')
    return dict(passed=all(s['passed'] for s in samples), samples=samples,
        limits=dict(global_mae=global_limit,visual_mae=visual_limit),
        scope='Sampled same-environment encoded/still agreement; not exhaustive artistic review or cross-device pixel identity.')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('video',type=Path)
    parser.add_argument('captures',type=Path)
    parser.add_argument('--global-limit',type=float,default=5)
    parser.add_argument('--visual-limit',type=float,default=6)
    parser.add_argument('--out',type=Path)
    args=parser.parse_args()
    result=compare(args.video,args.captures,args.global_limit,args.visual_limit)
    if args.out:
        args.out.parent.mkdir(parents=True,exist_ok=True)
        args.out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,indent=2))
    return 0 if result['passed'] else 1


if __name__=='__main__':
    raise SystemExit(main())
