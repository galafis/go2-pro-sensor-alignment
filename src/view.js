import { svg, label, esc, fmt, text } from './ui.js';
export const interpretation = {
  en: 'The fit estimates a planar rotation and translation with fixed scale. Fitted residuals can look optimistic; held-out fits expose sensitivity. It does not correct time offsets, 3D geometry, sensor distortion or mistaken correspondences automatically.',
  pt: 'O ajuste estima rotação e translação planas com escala fixa. Resíduos do ajuste podem parecer otimistas; ajustes de exclusão mostram sensibilidade. Não corrige automaticamente diferenças de tempo, geometria 3D, distorção de sensores ou correspondências incorretas.',
};
export const cursorMax = (r) => r.records.length - 1;
export function render(r, lang, cursor) {
  const points = r.records.flatMap((p) => [p.reference, p.aligned]),
    xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]),
    xmin = Math.min(...xs),
    ymin = Math.min(...ys),
    span = Math.max(1, Math.max(...xs) - xmin, Math.max(...ys) - ymin),
    scale = 210 / span,
    x = (v) => 270 + (v - xmin) * scale,
    y = (v) => 260 - (v - ymin) * scale;
  let c = label(
    20,
    24,
    text('Reference points and aligned observations', 'Referências e observações alinhadas', lang),
  );
  r.records.forEach((p, i) => {
    c += `<line x1="${x(p.reference[0])}" y1="${y(p.reference[1])}" x2="${x(p.aligned[0])}" y2="${y(p.aligned[1])}" stroke="#a34465"/><rect x="${x(p.reference[0]) - 4}" y="${y(p.reference[1]) - 4}" width="8" height="8" fill="#236f70"/><circle cx="${x(p.aligned[0])}" cy="${y(p.aligned[1])}" r="${i === cursor ? 7 : 4}" fill="none" stroke="#2367a1" stroke-width="2"/>`;
  });
  const p = r.records[cursor];
  return (
    svg(c, text('Rigid alignment residuals', 'Resíduos do alinhamento rígido', lang)) +
    `<p class="visual-note">${esc(text('Squares: reference. Rings: aligned.', 'Quadrados: referência. Círculos: alinhado.', lang))}<br><strong>${esc(p.id)}</strong> · ${esc(text('Fit residual', 'Resíduo do ajuste', lang))}: ${fmt(p.residualM, lang, 6)} m · ${esc(text('Held-out residual', 'Resíduo fora do ajuste', lang))}: ${fmt(p.heldOutM, lang, 6)} m.</p>`
  );
}
