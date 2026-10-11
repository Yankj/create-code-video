#!/usr/bin/env python3
"""Validate frame bounds, overlaps, read holds and a declared speech tail.

This checks structure, not narrative quality, factual accuracy or voice cadence.
Python 3.10+, standard library only.
"""
import argparse
import json
import math
from pathlib import Path


def validate(data):
    errors = []
    def integer(v):
        return isinstance(v, int) and not isinstance(v, bool)
    fps, total = data.get('fps'), data.get('durationFrames')
    if not isinstance(fps, (int, float)) or isinstance(fps, bool) or not math.isfinite(fps) or fps <= 0:
        errors.append('fps must be positive and finite')
    if not integer(total) or total <= 0:
        return errors + ['durationFrames must be a positive integer']
    shots = data.get('shots', [])
    if not isinstance(shots, list) or not shots:
        return errors + ['shots must be a nonempty array']
    ids, last_end, last_id = set(), 0, None
    for i, shot in enumerate(shots):
        if not isinstance(shot, dict):
            errors.append(f'shot {i} must be an object')
            continue
        sid, start, end = shot.get('id'), shot.get('startFrame'), shot.get('endFrame')
        if not isinstance(sid, str) or not sid or sid in ids:
            errors.append(f'shot {i}: id must be a unique string')
        else:
            ids.add(sid)
        if not all(integer(v) for v in (start, end)) or not 0 <= start < end <= total:
            errors.append(f'shot {sid}: invalid half-open frame bounds')
            continue
        if start > last_end:
            errors.append(f'shot {sid}: undeclared timeline gap')
        overlap = last_end - start
        transition = shot.get('transitionIn', {})
        if not isinstance(transition, dict):
            errors.append(f'shot {sid}: transitionIn must be an object')
            transition = {}
        if overlap > 0:
            if transition.get('from') != last_id or transition.get('overlapFrames') != overlap:
                errors.append(f'shot {sid}: overlap must declare from and exact overlapFrames')
            if overlap >= end-start:
                errors.append(f'shot {sid}: overlap consumes a complete shot')
        elif transition.get('overlapFrames', 0) != 0:
            errors.append(f'shot {sid}: declared overlap differs from bounds')
        hero = shot.get('hero', {})
        if not shot.get('purpose') or not isinstance(hero, dict) or not hero.get('id'):
            errors.append(f'shot {sid}: purpose and hero.id required')
        stable, hold = shot.get('stableFrame'), shot.get('readHoldFrames', 0)
        if not integer(hold) or hold < 0:
            errors.append(f'shot {sid}: readHoldFrames must be nonnegative integer')
        elif stable is not None and (not integer(stable) or not start <= stable <= end-hold):
            errors.append(f'shot {sid}: stable frame leaves insufficient read hold')
        last_end, last_id = end, sid
    if last_end != total:
        errors.append('last shot must end at durationFrames')
    audio = data.get('audio')
    if audio is not None:
        if not isinstance(audio, dict):
            return errors + ['audio must be an object']
        speech, hold = audio.get('lastSpeechFrame'), data.get('endingHoldFrames', 0)
        if not integer(speech) or not 0 <= speech <= total:
            errors.append('audio.lastSpeechFrame must be in the timeline')
        elif not integer(hold) or hold < 0 or total - speech < hold:
            errors.append('ending speech tail is shorter than endingHoldFrames')
    return errors


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('storyboard', type=Path)
    args = p.parse_args()
    try:
        data = json.loads(args.storyboard.read_text(encoding='utf-8'))
        if not isinstance(data, dict):
            raise ValueError('Root must be an object')
        errors = validate(data)
    except (OSError, ValueError, TypeError, AttributeError, KeyError) as e:
        errors = [str(e)]
    print(json.dumps({'valid': not errors, 'errors': errors,
                      'scope': 'Structure and timing only'}, ensure_ascii=False, indent=2))
    return int(bool(errors))


if __name__ == '__main__':
    raise SystemExit(main())
