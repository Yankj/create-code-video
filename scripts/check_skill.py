#!/usr/bin/env python3
"""Check local Markdown targets and reject accidental private/dependency files."""
import re
import json
from html.parser import HTMLParser
from urllib.parse import urlsplit
from pathlib import Path


class HTMLTargets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value:
                self.targets.append(value)


def local_targets(text):
    parser = HTMLTargets()
    parser.feed(text)
    targets = re.findall(r'\]\(([^\s)]+)', text) + parser.targets
    return [target.split('#')[0] for target in targets
            if not urlsplit(target).scheme and not target.startswith(('#', '//'))]


def missing_targets(text, parent):
    return [target for target in local_targets(text) if not (parent / target).exists()]


def main():
    root = Path(__file__).resolve().parents[1]
    errors = []
    for md in root.rglob('*.md'):
        if any(part in ('node_modules', '.git', 'out') for part in md.relative_to(root).parts):
            continue
        for target in missing_targets(md.read_text(encoding='utf-8'), md.parent):
            errors.append(f'{md.relative_to(root)}: missing {target}')
        if '/Users/' in md.read_text(encoding='utf-8'):
            errors.append(f'{md.relative_to(root)}: private absolute path')
    for path in ('SKILL.md', 'LICENSE', 'agents/openai.yaml', 'assets/icon.svg',
                 'README.md', 'README.zh-CN.md', 'assets/banner.svg', 'assets/motion-lab-preview.gif'):
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
    print('Local Markdown/HTML targets and required files passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
