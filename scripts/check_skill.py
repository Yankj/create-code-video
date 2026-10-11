#!/usr/bin/env python3
"""Check local Markdown targets and reject accidental private/dependency files."""
import re
import json
from urllib.parse import urlsplit
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    errors = []
    for md in root.rglob('*.md'):
        if any(part in ('node_modules', '.git', 'out') for part in md.relative_to(root).parts):
            continue
        for target in re.findall(r'\]\(([^\s)]+)', md.read_text(encoding='utf-8')):
            if ':' in target or target.startswith('#'):
                continue
            if not (md.parent / target.split('#')[0]).exists():
                errors.append(f'{md.relative_to(root)}: missing {target}')
        if '/Users/' in md.read_text(encoding='utf-8'):
            errors.append(f'{md.relative_to(root)}: private absolute path')
    for path in ('SKILL.md', 'LICENSE', 'agents/openai.yaml', 'assets/icon.svg'):
        if not (root / path).is_file():
            errors.append(f'Missing {path}')
    # These open-source examples use public npm only; reject a developer mirror
    # before it is accidentally included in a public bundle.
    for lock in (root / 'examples').glob('*/package-lock.json'):
        data = json.loads(lock.read_text(encoding='utf-8'))
        for name, package in data.get('packages', {}).items():
            url = package.get('resolved')
            if url and (urlsplit(url).scheme != 'https' or urlsplit(url).hostname != 'registry.npmjs.org'):
                errors.append(f'{lock.relative_to(root)}: {name} must use public npm HTTPS')
    if errors:
        print('\n'.join(errors))
        return 1
    print('Local Markdown targets and required files passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
