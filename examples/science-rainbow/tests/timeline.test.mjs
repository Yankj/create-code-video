import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const timeline = JSON.parse(readFileSync(join(root, 'src/timeline.json'), 'utf8'));
const v2 = readFileSync(join(root, 'src/RainbowV2.tsx'), 'utf8');
const v1 = readFileSync(join(root, 'src/Rainbow.tsx'), 'utf8');

test('five named beats cover the composition without gaps', () => {
  const names = timeline.scenes.map((scene) => scene.name);
  assert.deepEqual(names, ['hook', 'fact', 'why', 'order', 'board']);
  assert.equal(timeline.scenes[0].start, 0);
  assert.equal(timeline.scenes.at(-1).end, timeline.total);
  for (let i = 1; i < timeline.scenes.length; i += 1) {
    assert.equal(timeline.scenes[i].start, timeline.scenes[i - 1].end);
  }
});

test('each spoken line has audio on disk and a later start than the previous line', () => {
  let previous = -1;
  for (const scene of timeline.scenes) {
    for (const line of scene.lines) {
      assert.ok(line.text.length > 0);
      assert.ok(existsSync(join(root, 'public', line.file)), line.file);
      assert.ok(line.from > previous);
      assert.ok(line.dur > 0);
      previous = line.from;
    }
  }
  assert.ok(existsSync(join(root, 'public/bed.wav')));
});

test('v2 uses textbook cyan and does not keep v1 motion habits', () => {
  assert.match(v2, /'青'/);
  assert.doesNotMatch(v2, /靛/);
  assert.match(v2, /translate/);
  assert.doesNotMatch(v2, /transform:`scale/);
  assert.match(v1, /scale\(\$\{s\}\)/);
  assert.match(v1, /靛/);
});
