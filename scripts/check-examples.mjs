import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { run } from '../src/engine.js';
const index = JSON.parse(
  await readFile(new URL('../examples/index.json', import.meta.url), 'utf8'),
);
for (const entry of index) {
  const input = JSON.parse(
    await readFile(new URL('../examples/' + entry.file, import.meta.url), 'utf8'),
  );
  const expected = JSON.parse(
    await readFile(new URL('../examples/' + entry.report, import.meta.url), 'utf8'),
  );
  const actual = await run(input);
  assert.deepEqual(actual, expected, entry.file);
  assert.equal(actual.status, entry.expectedStatus);
  console.log(entry.file + ' → ' + actual.status);
}
