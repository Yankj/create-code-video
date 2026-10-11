import importlib.util
import tempfile
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('links', ROOT/'scripts/check_skill.py')
links = importlib.util.module_from_spec(spec)
spec.loader.exec_module(links)

class DocumentLinksTests(unittest.TestCase):
    def test_html_image_missing_is_rejected_alongside_markdown(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root/'README.zh-CN.md').write_text('中文')
            text = '<img src="assets/old.gif"/><a href="README.zh-CN.md">中文</a> [guide](gone.md)'
            self.assertEqual(links.missing_targets(text, root), ['gone.md','assets/old.gif'])

    def test_external_badges_and_section_anchors_are_not_local_paths(self):
        text = '<img src="https://img.shields.io/badge/test-ok-green"/> [start](#start) [web](https://example.com)'
        self.assertEqual(links.local_targets(text), [])
