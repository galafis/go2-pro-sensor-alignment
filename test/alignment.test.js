import test from 'node:test';
import assert from 'node:assert/strict';
import { run, fit, transformPoint } from '../src/engine.js';
const near = (a, b, eps = 1e-8) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const pairs = (t) =>
  [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
  ].map((observed, i) => ({
    id: 'p-' + i,
    observed,
    reference: transformPoint(observed, t),
    weight: 1,
  }));
const s = (extra = {}) => ({
  schemaVersion: 1,
  scenarioId: 'test',
  source: 'synthetic',
  maxResidualM: 0.1,
  pairs: pairs({ angleRad: Math.PI / 2, translation: [3, 2] }),
  evaluationPoints: [[1, 1]],
  ...extra,
});
test('known quarter turn and translation are recovered', () => {
  const r = run(s());
  near(r.transform.angleRad, Math.PI / 2);
  near(r.transform.translation[0], 3);
  near(r.transform.translation[1], 2);
  assert.equal(r.metrics[1].value, 0);
});
test('evaluation points use the fitted transform', () =>
  assert.deepEqual(run(s()).evaluationPoints[0].aligned, [2, 3]));
test('identity transform remains identity', () => {
  const r = run(s({ pairs: pairs({ angleRad: 0, translation: [0, 0] }) }));
  near(r.transform.angleRad, 0);
  assert.equal(r.metrics[1].value, 0);
});
test('many known rigid transforms recover orientation and translation', () => {
  for (let i = -12; i <= 12; i++) {
    const t = { angleRad: (i * Math.PI) / 13, translation: [i * 17, -i * 3] },
      actual = fit(pairs(t));
    near(actual.angleRad, t.angleRad);
    near(actual.translation[0], t.translation[0]);
    near(actual.translation[1], t.translation[1]);
  }
});
test('global weight scaling leaves the fit unchanged', () => {
  const input = s(),
    a = fit(input.pairs),
    b = fit(input.pairs.map((p) => ({ ...p, weight: 100 })));
  near(a.angleRad, b.angleRad);
  a.translation.forEach((v, i) => near(v, b.translation[i]));
});
test('two distinct correspondences determine a 2D rigid fit', () => {
  const r = run(s({ pairs: s().pairs.slice(0, 2) }));
  assert.equal(r.metrics[1].value, 0);
  assert.equal(r.heldOutComputed, 0);
  assert.equal(r.records[0].heldOutStatus, 'insufficient-pairs');
});
test('coincident observed points are rejected as degenerate', () =>
  assert.throws(() => run(s({ pairs: s().pairs.map((p) => ({ ...p, observed: [0, 0] })) })), {
    code: 'DEGENERATE',
  }));
test('coincident reference points are rejected as degenerate', () =>
  assert.throws(() => run(s({ pairs: s().pairs.map((p) => ({ ...p, reference: [0, 0] })) })), {
    code: 'DEGENERATE',
  }));
test('outlier increases fitted and held-out residuals', () => {
  const input = s();
  input.pairs[2].reference[0] += 1;
  const r = run(input);
  assert.ok(r.metrics[2].value > 0.1);
  assert.ok(r.metrics[3].value > r.metrics[2].value);
  assert.ok(r.findings.some((f) => f.code === 'HELD_OUT_RESIDUAL'));
});
test('fixed scale does not silently fit a scaled point cloud', () => {
  const input = s();
  input.pairs.forEach((p) => {
    p.reference = p.observed.map((v) => v * 2);
  });
  assert.ok(run(input).metrics[1].value > 1);
});
test('reflection is not accepted as a zero-residual rigid fit', () => {
  const input = s();
  input.pairs[2].observed = [3, 2];
  input.pairs.forEach((p) => {
    p.reference = [-p.observed[0], p.observed[1]];
  });
  assert.ok(run(input).metrics[1].value > 0.1);
});
test('held-out degeneracy is exposed instead of silently dropping the point', () => {
  const input = s({
    pairs: [
      { id: 'a', observed: [0, 0], reference: [1, 0], weight: 1 },
      { id: 'b', observed: [0, 0], reference: [1, 0], weight: 1 },
      { id: 'c', observed: [1, 0], reference: [2, 0], weight: 1 },
    ],
  });
  const r = run(input);
  assert.equal(r.records[2].heldOutStatus, 'degenerate-subset');
  assert.equal(r.heldOutComputed, 2);
});
test('negative weights and duplicate landmark identities are rejected', () => {
  const input = s();
  input.pairs[0].weight = -1;
  assert.throws(() => run(input));
  const duplicate = s();
  duplicate.pairs[1].id = duplicate.pairs[0].id;
  assert.throws(() => run(duplicate), { code: 'DUPLICATE' });
});
test('large common coordinate offset does not destroy a well-spread fit', () => {
  const t = { angleRad: 0.1, translation: [2, 3] },
    input = s();
  input.pairs = input.pairs.map((p) => {
    const observed = p.observed.map((v) => v + 10000);
    return { ...p, observed, reference: transformPoint(observed, t) };
  });
  const r = run(input);
  near(r.transform.angleRad, t.angleRad, 1e-7);
});

test('fitted residual decisions retain sub-micrometre threshold differences', () => {
  const input = s({
    maxResidualM: 0.1,
    pairs: [
      { id: 'a', observed: [-1, 0], reference: [-1.1000002, 0], weight: 1 },
      { id: 'b', observed: [1, 0], reference: [1.1000002, 0], weight: 1 },
    ],
  });
  const result = run(input);
  assert.equal(result.metrics[2].value, 0.1);
  assert.ok(result.findings.some((f) => f.code === 'FIT_RESIDUAL'));
  input.maxResidualM = 0.1000003;
  assert.ok(!run(input).findings.some((f) => f.code === 'FIT_RESIDUAL'));
});

test('held-out residual decisions use unrounded independent fit distances', () => {
  const input = s({
    maxResidualM: 0.2000001,
    pairs: [
      { id: 'a', observed: [-1, 0], reference: [-1.1000002, 0], weight: 1 },
      { id: 'b', observed: [0, 0], reference: [0, 0], weight: 1 },
      { id: 'c', observed: [1, 0], reference: [1.1000002, 0], weight: 1 },
    ],
  });
  // Holding out an endpoint leaves a translation of 0.0500001 m:
  // the endpoint's independent residual is 0.1500003 m.
  input.maxResidualM = 0.1500001;
  const result = run(input);
  assert.equal(result.metrics[3].value, 0.15);
  assert.ok(result.findings.some((f) => f.code === 'HELD_OUT_RESIDUAL'));
  input.maxResidualM = 0.1500004;
  assert.ok(!run(input).findings.some((f) => f.code === 'HELD_OUT_RESIDUAL'));
});
