export class InputError extends Error {
  constructor(code, en, pt) {
    super(en);
    this.name = 'InputError';
    this.code = code;
    this.localized = { en, pt };
  }
}
export function requireThat(ok, code, en, pt) {
  if (!ok) throw new InputError(code, en, pt);
}
export function object(value, name, allowed) {
  requireThat(
    value !== null && typeof value === 'object' && !Array.isArray(value),
    'OBJECT',
    `${name}: expected an object.`,
    `${name}: informe um objeto.`,
  );
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  requireThat(
    !unknown.length,
    'UNKNOWN_FIELD',
    `${name}: unrecognized fields are not accepted.`,
    `${name}: campos desconhecidos não são aceitos.`,
  );
}
export function number(value, name, min = 0, max = 1e9) {
  requireThat(
    typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max,
    'NUMBER',
    `${name}: expected a finite number between ${min} and ${max}.`,
    `${name}: informe um número finito entre ${min} e ${max}.`,
  );
  return value;
}
export function integer(value, name, min = 0, max = 1e9) {
  number(value, name, min, max);
  requireThat(
    Number.isSafeInteger(value),
    'INTEGER',
    `${name}: expected an integer.`,
    `${name}: informe um número inteiro.`,
  );
  return value;
}
export function choice(value, name, values) {
  requireThat(
    values.includes(value),
    'CHOICE',
    `${name}: use one of ${values.join(', ')}.`,
    `${name}: use uma das opções ${values.join(', ')}.`,
  );
  return value;
}
export function list(value, name, min = 0, max = 10000) {
  requireThat(
    Array.isArray(value) && value.length >= min && value.length <= max,
    'ARRAY',
    `${name}: expected ${min}–${max} items.`,
    `${name}: informe de ${min} a ${max} itens.`,
  );
  return value;
}
export function identifier(value, name) {
  requireThat(
    typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(value),
    'IDENTIFIER',
    `${name}: use 1–64 lowercase letters, digits, dashes or underscores.`,
    `${name}: use de 1 a 64 letras minúsculas, números, hífens ou sublinhados.`,
  );
  return value;
}
export function base(input, extra) {
  object(input, 'scenario', ['schemaVersion', 'scenarioId', 'source', ...extra]);
  requireThat(
    input.schemaVersion === 1,
    'VERSION',
    'Only schemaVersion 1 is supported.',
    'Somente schemaVersion 1 é aceito.',
  );
  identifier(input.scenarioId, 'scenarioId');
  choice(input.source, 'source', ['synthetic', 'manual']);
}
export function unique(values, name) {
  requireThat(
    new Set(values).size === values.length,
    'DUPLICATE',
    `${name}: duplicate identifiers are not accepted.`,
    `${name}: identificadores duplicados não são aceitos.`,
  );
}
export const message = (en, pt) => ({ en, pt });
export const metric = (key, en, pt, value, unit = '') => ({
  key,
  label: message(en, pt),
  value,
  unit,
});
export const finding = (severity, code, en, pt, context = {}) => ({
  severity,
  code,
  message: message(en, pt),
  ...context,
});
export const round = (n, digits = 6) => Number(n.toFixed(digits));
export function report(input, projectId, metrics, findings, records, extra = {}) {
  return {
    schemaVersion: 1,
    analysisVersion: '0.1.0',
    projectId,
    scenarioId: input.scenarioId,
    source: input.source,
    status: findings.some((f) => f.severity === 'error')
      ? 'review-required'
      : findings.length
        ? 'review-notes'
        : 'complete',
    metrics,
    findings,
    records,
    ...extra,
  };
}
