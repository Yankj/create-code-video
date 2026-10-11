import copy
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('preview', ROOT/'scripts/build_preview.py')
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)

class PreviewTests(unittest.TestCase):
    def setUp(self):
        self.report = json.loads((ROOT/'assets/motion-lab-preview.json').read_text())

    def check_copy(self, data):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'report.json'
            path.write_text(json.dumps(data))
            return preview.check(path)

    def test_shipped_preview_is_current_and_decodes(self):
        self.assertEqual(self.check_copy(self.report)['gif']['duration_ms'], 18000)

    def test_changed_source_hash_requires_rebuild(self):
        bad = copy.deepcopy(self.report)
        bad['source_files_sha256'][next(iter(bad['source_files_sha256']))] = '0'*64
        with self.assertRaisesRegex(ValueError, 'changed: preview must be rebuilt'):
            self.check_copy(bad)

    def test_changed_asset_hash_is_rejected(self):
        bad = copy.deepcopy(self.report)
        bad['preview_sha256'] = '0'*64
        with self.assertRaisesRegex(ValueError, 'Preview checksum differs'):
            self.check_copy(bad)
