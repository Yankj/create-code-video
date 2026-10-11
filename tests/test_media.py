import importlib.util
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('qa', ROOT / 'scripts/qa_video.py')
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'), 'ffmpeg/ffprobe not installed')
class MediaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.video = Path(cls.temp.name) / 'valid.mp4'
        subprocess.run(['ffmpeg','-v','error','-nostdin','-f','lavfi','-i',
                        'testsrc2=size=160x90:rate=24:duration=1','-f','lavfi','-i',
                        'sine=frequency=440:sample_rate=44100:duration=1','-c:v','libx264',
                        '-pix_fmt','yuv420p','-c:a','aac','-shortest',str(cls.video)], check=True)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_actual_media_decodes_and_matches(self):
        result = qa.inspect(self.video,160,90,24,1,loudness=True)
        self.assertTrue(result['passed'])
        self.assertTrue(result['fullDecode'])
        self.assertEqual(result['actual']['audio'][0]['sample_rate'],'44100')
        self.assertIn('input_i',result['loudness'])

    def test_mismatching_delivery_specs_fail(self):
        result = qa.inspect(self.video,width=1080,fps=30,duration=10)
        self.assertFalse(result['passed'])
        self.assertEqual(len(result['errors']),3)

    def test_corrupt_media_is_rejected(self):
        corrupt = Path(self.temp.name) / 'corrupt.mp4'
        corrupt.write_bytes(b'not an encoded video')
        with self.assertRaises(subprocess.CalledProcessError):
            qa.inspect(corrupt)


if __name__ == '__main__':
    unittest.main()
