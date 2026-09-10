import {
  base,
  object,
  number,
  list,
  identifier,
  unique,
  requireThat,
  metric,
  finding,
  report,
  round,
} from './validation.js';
function point(p, name) {
  list(p, name, 2, 2);
  p.forEach((v) => number(v, name, -100000, 100000));
}
export function validate(s) {
  base(s, ['maxResidualM', 'pairs', 'evaluationPoints']);
  number(s.maxResidualM, 'maxResidualM', 0.001, 100);
  list(s.pairs, 'pairs', 2, 200);
  s.pairs.forEach((p) => object(p, 'pair', ['id', 'observed', 'reference', 'weight']));
  unique(
    s.pairs.map((p) => p.id),
    'pairs',
  );
  s.pairs.forEach((p) => {
    object(p, 'pair', ['id', 'observed', 'reference', 'weight']);
    identifier(p.id, 'pair.id');
    point(p.observed, 'observed');
    point(p.reference, 'reference');
    number(p.weight, 'weight', 0.001, 1000);
  });
  list(s.evaluationPoints, 'evaluationPoints', 0, 1000);
  s.evaluationPoints.forEach((p) => point(p, 'evaluationPoint'));
  return s;
}
export function transformPoint(p, t) {
  const c = Math.cos(t.angleRad),
    s = Math.sin(t.angleRad);
  return [c * p[0] - s * p[1] + t.translation[0], s * p[0] + c * p[1] + t.translation[1]];
}
/** Weighted 2D proper rigid fit: translation + rotation, fixed unit scale. */
export function fit(pairs) {
  const sum = pairs.reduce((v, p) => v + p.weight, 0),
    a = [0, 0],
    b = [0, 0];
  for (const p of pairs)
    for (let d = 0; d < 2; d++) {
      a[d] += (p.weight / sum) * p.observed[d];
      b[d] += (p.weight / sum) * p.reference[d];
    }
  let dot = 0,
    cross = 0,
    spread = 0,
    referenceSpread = 0;
  for (const p of pairs) {
    const x = p.observed[0] - a[0],
      y = p.observed[1] - a[1],
      u = p.reference[0] - b[0],
      v = p.reference[1] - b[1];
    dot += p.weight * (x * u + y * v);
    cross += p.weight * (x * v - y * u);
    spread += p.weight * (x * x + y * y);
    referenceSpread += p.weight * (u * u + v * v);
  }
  requireThat(
    spread > 1e-12 &&
      referenceSpread > 1e-12 &&
      Math.hypot(dot, cross) > 1e-12 * Math.sqrt(spread * referenceSpread),
    'DEGENERATE',
    'Correspondences do not determine a stable rotation.',
    'As correspondências não determinam uma rotação estável.',
  );
  const angleRad = Math.atan2(cross, dot),
    rotated = transformPoint(a, { angleRad, translation: [0, 0] });
  return { angleRad, translation: [b[0] - rotated[0], b[1] - rotated[1]] };
}
export function run(s) {
  validate(s);
  const transform = fit(s.pairs),
    findings = [],
    rawResiduals = [],
    rawHeldOutResiduals = [];
  const records = s.pairs.map((p, i) => {
    const aligned = transformPoint(p.observed, transform),
      residualM = Math.hypot(aligned[0] - p.reference[0], aligned[1] - p.reference[1]);
    rawResiduals.push(residualM);
    let heldOutM = null,
      heldOutStatus = 'insufficient-pairs';
    if (s.pairs.length > 2) {
      try {
        const t = fit(s.pairs.filter((_, j) => i !== j)),
          out = transformPoint(p.observed, t);
        heldOutM = Math.hypot(out[0] - p.reference[0], out[1] - p.reference[1]);
        rawHeldOutResiduals.push(heldOutM);
        heldOutStatus = 'computed';
      } catch (error) {
        if (error.code !== 'DEGENERATE') throw error;
        heldOutStatus = 'degenerate-subset';
      }
    }
    return {
      id: p.id,
      observed: [...p.observed],
      reference: [...p.reference],
      aligned: aligned.map((v) => round(v)),
      weight: p.weight,
      residualM: round(residualM),
      heldOutM: heldOutM === null ? null : round(heldOutM),
      heldOutStatus,
    };
  });
  const totalWeight = s.pairs.reduce((v, p) => v + p.weight, 0),
    rmse = Math.sqrt(
      s.pairs.reduce((v, p) => {
        const q = transformPoint(p.observed, transform);
        return v + p.weight * ((q[0] - p.reference[0]) ** 2 + (q[1] - p.reference[1]) ** 2);
      }, 0) / totalWeight,
    );
  // Decide with full precision; rounding is only a report presentation policy.
  const maxResidual = Math.max(...rawResiduals),
    heldOut = records.filter((p) => p.heldOutM !== null),
    maxHeldOut = heldOut.length ? Math.max(...rawHeldOutResiduals) : null;
  if (maxResidual > s.maxResidualM)
    findings.push(
      finding(
        'warning',
        'FIT_RESIDUAL',
        'At least one fitted residual exceeds the review threshold.',
        'Ao menos um resíduo do ajuste excede o limiar de revisão.',
      ),
    );
  if (maxHeldOut !== null && maxHeldOut > s.maxResidualM)
    findings.push(
      finding(
        'warning',
        'HELD_OUT_RESIDUAL',
        'A held-out residual exceeds the review threshold.',
        'Um resíduo fora do ajuste excede o limiar de revisão.',
      ),
    );
  if (heldOut.length < s.pairs.length)
    findings.push(
      finding(
        'info',
        'HELD_OUT_UNAVAILABLE',
        'Some held-out fits are unavailable; inspect their status.',
        'Alguns ajustes de exclusão estão indisponíveis; inspecione seus estados.',
      ),
    );
  return report(
    s,
    'go2-pro-sensor-alignment',
    [
      metric(
        'angleDeg',
        'Fitted rotation',
        'Rotação ajustada',
        round((transform.angleRad * 180) / Math.PI),
        '°',
      ),
      metric('rmseM', 'Weighted fit RMSE', 'RMSE ponderado do ajuste', round(rmse), 'm'),
      metric(
        'maxResidualM',
        'Maximum fitted residual',
        'Maior resíduo do ajuste',
        round(maxResidual),
        'm',
      ),
      metric(
        'maxHeldOutM',
        'Maximum held-out residual',
        'Maior resíduo fora do ajuste',
        maxHeldOut === null ? null : round(maxHeldOut),
        'm',
      ),
    ],
    findings,
    records,
    {
      transform,
      evaluationPoints: s.evaluationPoints.map((p) => ({
        observed: [...p],
        aligned: transformPoint(p, transform).map((v) => round(v)),
      })),
      heldOutComputed: heldOut.length,
      model: 'proper rigid 2D; unit scale; no reflection',
    },
  );
}
