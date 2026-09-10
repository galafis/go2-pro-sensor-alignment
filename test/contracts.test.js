import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { run } from '../src/engine.js';
import config from '../src/config.js';
import { render } from '../src/view.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const load = (name) =>
  JSON.parse(readFileSync(new URL('../examples/' + name, import.meta.url), 'utf8'));
const index = load('index.json'),
  nominal = () => load('nominal.json');
for (const entry of index)
  test('reproducible example: ' + entry.file, () => {
    const r = run(load(entry.file));
    assert.deepEqual(r, load(entry.report));
    assert.equal(r.status, entry.expectedStatus);
  });
test('analysis preserves inputs and repeated runs are identical', () => {
  const s = nominal(),
    copy = structuredClone(s),
    a = run(s);
  assert.deepEqual(s, copy);
  assert.deepEqual(run(s), a);
});
test('report preserves source and version without runtime timestamps', () => {
  const r = run({ ...nominal(), source: 'manual' });
  assert.equal(r.source, 'manual');
  assert.equal(r.analysisVersion, '0.1.0');
  assert.equal(r.projectId, config.slug);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), r);
});
test('unsupported versions, unknown fields and invalid provenance are rejected', () => {
  for (const patch of [
    { schemaVersion: 99 },
    { privateField: 'untrusted' },
    { source: 'measured' },
  ])
    assert.throws(() => run({ ...nominal(), ...patch }));
});
test('non-finite primary values are rejected', () => {
  for (const value of [NaN, Infinity, -Infinity, null, '1'])
    assert.throws(() => run({ ...nominal(), [config.setting.key]: value }));
});
test('bilingual chart renders data without non-finite coordinates', () => {
  const r = run(nominal());
  for (const lang of ['en', 'pt']) {
    const markup = render(r, lang, 0);
    assert.match(markup, /<svg/);
    assert.doesNotMatch(markup, /NaN|Infinity|undefined/);
    assert.match(markup, /aria-label=/);
  }
});
test('primary input default aligns with native numeric stepping', () => {
  const value = nominal()[config.setting.key],
    q = (value - config.setting.min) / config.setting.step;
  assert.ok(Math.abs(q - Math.round(q)) < 1e-7);
});
test('CLI writes the same report as the domain engine', () => {
  const dir = mkdtempSync(join(tmpdir(), 'go2-report-'));
  try {
    const out = join(dir, 'report.json'),
      result = spawnSync(process.execPath, ['scripts/analyze.mjs', 'examples/nominal.json', out], {
        cwd: root,
        encoding: 'utf8',
      });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), run(nominal()));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test('CLI rejects invalid input without creating a success report', () => {
  const dir = mkdtempSync(join(tmpdir(), 'go2-invalid-'));
  try {
    const input = join(dir, 'invalid.json');
    writeFileSync(input, '{"schemaVersion":99}');
    const result = spawnSync(process.execPath, ['scripts/analyze.mjs', input], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /error/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
