import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE = ROOT / 'examples' / 'science-rainbow'


class ScienceRainbowTests(unittest.TestCase):
    def test_timeline_beats_and_voice_files(self):
        timeline = json.loads((EXAMPLE / 'src' / 'timeline.json').read_text(encoding='utf-8'))
        names = [scene['name'] for scene in timeline['scenes']]
        self.assertEqual(names, ['hook', 'fact', 'why', 'order', 'board'])
        self.assertEqual(timeline['scenes'][0]['start'], 0)
        self.assertEqual(timeline['scenes'][-1]['end'], timeline['total'])
        previous = -1
        for scene in timeline['scenes']:
            for line in scene['lines']:
                self.assertTrue((EXAMPLE / 'public' / line['file']).is_file(), line['file'])
                self.assertGreater(line['from'], previous)
                previous = line['from']
        self.assertTrue((EXAMPLE / 'public' / 'bed.wav').is_file())

    def test_v2_keeps_textbook_cyan(self):
        source = (EXAMPLE / 'src' / 'RainbowV2.tsx').read_text(encoding='utf-8')
        self.assertIn("'青'", source)
        self.assertNotIn('靛', source)
