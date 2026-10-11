import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validator', ROOT / 'scripts/validate_storyboard.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


class StoryboardTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT / 'examples/storyboard.example.json').read_text())

    def test_valid_example(self):
        self.assertEqual(validator.validate(self.data), [])

    def test_gap_and_undeclared_overlap_rejected(self):
        self.data['shots'][1]['startFrame'] += 2
        self.assertTrue(any('gap' in e for e in validator.validate(self.data)))
        self.data['shots'][1]['startFrame'] -= 4
        self.assertTrue(any('overlap must' in e for e in validator.validate(self.data)))

    def test_declared_overlap_accepted(self):
        first, second = self.data['shots'][:2]
        second['startFrame'] = first['endFrame'] - 12
        second['transitionIn'] = {'from': first['id'], 'overlapFrames': 12}
        self.assertEqual(validator.validate(self.data), [])

    def test_nonfinite_fps_and_invalid_bounds(self):
        self.data['fps'] = float('nan')
        self.data['shots'][0]['startFrame'] = True
        self.assertGreaterEqual(len(validator.validate(self.data)), 2)

    def test_duplicate_id_and_insufficient_read_hold(self):
        self.data['shots'][1]['id'] = self.data['shots'][0]['id']
        self.data['shots'][0]['stableFrame'] = self.data['shots'][0]['endFrame'] - 1
        self.assertTrue(any('unique' in e for e in validator.validate(self.data)))
        self.assertTrue(any('read hold' in e for e in validator.validate(self.data)))

    def test_speech_tail_not_cut(self):
        self.data['audio'] = {'lastSpeechFrame': self.data['durationFrames'] - 3}
        self.data['endingHoldFrames'] = 24
        self.assertTrue(any('speech tail' in e for e in validator.validate(self.data)))


if __name__ == '__main__':
    unittest.main()
