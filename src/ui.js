export const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const text = (en, pt, lang) => (lang === 'pt' ? pt : en);
export const fmt = (value, lang = 'en', digits = 2) =>
  typeof value === 'number'
    ? new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
        maximumFractionDigits: digits,
      }).format(value)
    : String(value ?? '—');
export const svg = (content, label, height = 300) =>
  `<svg class="chart" viewBox="0 0 760 ${height}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${content}</svg>`;
export const label = (x, y, value, extra = '') =>
  `<text x="${x}" y="${y}" ${extra}>${esc(value)}</text>`;
export function extent(values) {
  const min = Math.min(...values),
    max = Math.max(...values);
  return min === max ? [min - 1, max + 1] : [min, max];
}
export function download(name, value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const states = {
  idle: { en: 'Idle', pt: 'Inativo' },
  ready: { en: 'Ready', pt: 'Pronto' },
  active: { en: 'Active', pt: 'Ativo' },
  paused: { en: 'Paused', pt: 'Pausado' },
  stopped: { en: 'Stopped', pt: 'Interrompido' },
  completed: { en: 'Completed', pt: 'Concluído' },
  valid: { en: 'Valid', pt: 'Válida' },
  invalid: { en: 'Invalid', pt: 'Inválida' },
};
