import config from './config.js';
import { run } from './engine.js';
import { render, cursorMax, interpretation } from './view.js';
import { esc, fmt, download, states } from './ui.js';
const $ = (id) => document.getElementById(id);
const dictionary = {
  skip: ['Skip to workbench', 'Ir para a bancada'],
  source: ['Source & documentation', 'Código e documentação'],
  companion: ['· independent research prototype', '· protótipo de pesquisa independente'],
  version: ['Working prototype · v0.1.0', 'Protótipo funcional · v0.1.0'],
  intro: [
    'Load an example, change an assumption, and inspect the result. Everything runs in your browser.',
    'Abra um exemplo, altere uma hipótese e inspecione o resultado. Tudo é processado no navegador.',
  ],
  scope: ['Research scope and next steps →', 'Escopo de pesquisa e próximas etapas →'],
  scenario: ['SCENARIO', 'CENÁRIO'],
  configure: ['Choose your experiment', 'Escolha seu experimento'],
  example: ['Example scenario', 'Cenário de exemplo'],
  update: ['Update', 'Atualizar'],
  assumption: [
    'Example values are synthetic assumptions. Review them before using your own records.',
    'Os valores de exemplo são hipóteses sintéticas. Revise-os antes de usar seus próprios registros.',
  ],
  import: ['Import scenario JSON · up to 1 MB', 'Importar cenário JSON · até 1 MB'],
  saveScenario: ['Export scenario', 'Exportar cenário'],
  reset: ['Reset selected example', 'Restaurar exemplo selecionado'],
  editor: ['Edit all scenario fields', 'Editar todos os campos do cenário'],
  json: ['Scenario JSON', 'JSON do cenário'],
  analyze: ['Analyze changes', 'Analisar alterações'],
  loading: ['Loading experiment…', 'Carregando experimento…'],
  results: ['RESULTS', 'RESULTADOS'],
  visual: ['Explore the result', 'Explore o resultado'],
  cursor: ['Review position', 'Posição de revisão'],
  findings: ['Findings & interpretation', 'Resultados e interpretação'],
  reproduce: ['Keep the experiment reproducible', 'Preserve a reprodução do experimento'],
  reproduceBody: [
    'Export the scenario and report together. Reports retain their source label and analysis version.',
    'Exporte o cenário e o relatório juntos. Os relatórios mantêm a origem dos dados e a versão da análise.',
  ],
  saveReport: ['Export report', 'Exportar relatório'],
  records: ['Inspect the analysis records', 'Inspecionar os registros da análise'],
  recordLimit: [
    'The table previews up to 200 records. The export contains the complete result.',
    'A tabela exibe até 200 registros. A exportação contém o resultado completo.',
  ],
  footer: [
    'Independent software prototype. Physical integration requires separate interface confirmation and validation.',
    'Protótipo independente de software. A integração física exige confirmação de interfaces e validação próprias.',
  ],
  privacy: ['Privacy & security', 'Privacidade e segurança'],
  noFindings: [
    'No issues found within the supplied model and inputs.',
    'Nenhum problema identificado no modelo e nos dados informados.',
  ],
  synthetic: ['SYNTHETIC EXAMPLE', 'EXEMPLO SINTÉTICO'],
  manual: ['MANUALLY SUPPLIED', 'DADOS INFORMADOS MANUALMENTE'],
  complete: ['Analysis complete', 'Análise concluída'],
  'review-notes': ['Review notes', 'Notas para revisão'],
  'review-required': ['Review required', 'Revisão necessária'],
  rejected: [
    'Input rejected. The last valid result remains displayed.',
    'Entrada rejeitada. O último resultado válido permanece em exibição.',
  ],
  problem: [
    'Unable to read this scenario. Check the JSON file and field values.',
    'Não foi possível ler o cenário. Verifique o JSON e os valores dos campos.',
  ],
  tooLarge: ['The input exceeds 1 MB.', 'A entrada excede 1 MB.'],
};
let lang = 'en';
try {
  if (localStorage.getItem('research-language') === 'pt') lang = 'pt';
} catch {}
let examples = [],
  current = null,
  result = null,
  revision = 0,
  lastError = null;
const t = (key) => dictionary[key]?.[lang === 'pt' ? 1 : 0] || key;
function translate() {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document
    .querySelectorAll('[data-i18n]')
    .forEach((element) => (element.textContent = t(element.dataset.i18n)));
  $('language').textContent = lang === 'en' ? 'Português' : 'English';
  $('language').setAttribute(
    'aria-label',
    lang === 'en' ? 'Switch to Portuguese' : 'Mudar para inglês',
  );
  $('tagline').textContent = config.tagline[lang];
  $('setting-label').textContent = config.setting.label[lang];
  [...$('example').options].forEach((option, i) => (option.textContent = examples[i].label[lang]));
  if (result) display();
  if (lastError) showError(lastError);
}
function showError(error) {
  lastError = error;
  $('error').hidden = false;
  $('error').textContent =
    `${error.localized?.[lang] || t('problem')} ${result ? t('rejected') : ''}`;
}
function visualize() {
  if (!result) return;
  const position = Number($('cursor').value);
  $('visual').innerHTML = render(result, lang, position);
  $('cursor-value').textContent = fmt(position, lang, 0);
}
function display() {
  $('report-content').hidden = false;
  $('provenance').textContent = t(result.source);
  $('report-status').textContent = t(result.status);
  $('metrics').innerHTML = result.metrics
    .map(
      (m) =>
        `<article class="metric"><div class="metric-label">${esc(m.label[lang])}</div><div class="metric-value">${esc(states[m.value]?.[lang] ?? fmt(m.value, lang))}<span class="metric-unit">${esc(m.unit)}</span></div></article>`,
    )
    .join('');
  const maximum = cursorMax(result);
  $('cursor').max = Math.max(0, maximum);
  $('cursor').value = Math.min(Number($('cursor').value), maximum);
  $('cursor').disabled = maximum === 0;
  visualize();
  $('findings').innerHTML = result.findings.length
    ? result.findings
        .map(
          (f) =>
            `<div class="finding ${esc(f.severity)}"><span class="finding-code">${esc(f.code)}</span>${esc(f.message[lang])}</div>`,
        )
        .join('')
    : `<p class="muted">${esc(t('noFindings'))}</p>`;
  $('interpretation').textContent = interpretation[lang];
  const keys = [...new Set(result.records.slice(0, 200).flatMap(Object.keys))];
  const cell = (value) =>
    value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—');
  $('records').innerHTML =
    `<table><thead><tr>${keys.map((k) => `<th scope="col">${esc(k)}</th>`).join('')}</tr></thead><tbody>${result.records
      .slice(0, 200)
      .map((row) => `<tr>${keys.map((k) => `<td>${esc(cell(row[k]))}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
}
async function executeText(value, token = ++revision) {
  $('busy').hidden = false;
  $('error').hidden = true;
  lastError = null;
  try {
    if (new TextEncoder().encode(value).length > 1000000)
      throw { localized: { en: dictionary.tooLarge[0], pt: dictionary.tooLarge[1] } };
    const parsed = JSON.parse(value),
      analyzed = await run(parsed);
    if (token !== revision) return;
    current = parsed;
    result = analyzed;
    $('editor').value = JSON.stringify(current, null, 2);
    $('setting').value = current[config.setting.key];
    $('cursor').value = 0;
    display();
  } catch (error) {
    if (token === revision) showError(error);
  } finally {
    if (token === revision) $('busy').hidden = true;
  }
}
async function loadExample() {
  const token = ++revision;
  try {
    const response = await fetch(`examples/${examples[Number($('example').value)].file}`);
    if (!response.ok) throw new Error('Example unavailable');
    const value = await response.text();
    if (token === revision) await executeText(value, token);
  } catch (error) {
    if (token === revision) {
      showError(error);
      $('busy').hidden = true;
    }
  }
}
$('language').addEventListener('click', () => {
  lang = lang === 'en' ? 'pt' : 'en';
  try {
    localStorage.setItem('research-language', lang);
  } catch {}
  translate();
});
$('example').addEventListener('change', loadExample);
$('reset').addEventListener('click', loadExample);
$('analyze').addEventListener('click', () => executeText($('editor').value));
$('apply-setting').addEventListener('click', () => {
  try {
    if (!$('setting').checkValidity() || $('setting').value === '') {
      $('setting').reportValidity();
      return;
    }
    const value = JSON.parse($('editor').value);
    value[config.setting.key] = Number($('setting').value);
    executeText(JSON.stringify(value));
  } catch (error) {
    showError(error);
  }
});
$('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const token = ++revision;
  try {
    if (file.size > 1000000)
      throw { localized: { en: dictionary.tooLarge[0], pt: dictionary.tooLarge[1] } };
    const content = await file.text();
    if (token === revision) await executeText(content, token);
  } catch (error) {
    if (token === revision) showError(error);
  }
  event.target.value = '';
});
$('download-scenario').addEventListener('click', () => {
  if (current) download(`${current.scenarioId}.json`, current);
});
$('download-report').addEventListener('click', () => {
  if (result) download(`${result.scenarioId}.report.json`, result);
});
$('cursor').addEventListener('input', visualize);
for (const key of ['min', 'max', 'step']) $('setting')[key] = config.setting[key];
$('setting').required = true;
try {
  const response = await fetch('examples/index.json');
  if (!response.ok) throw new Error('Examples unavailable');
  examples = await response.json();
  $('example').innerHTML = examples
    .map((item, i) => `<option value="${i}">${esc(item.label[lang])}</option>`)
    .join('');
  translate();
  await loadExample();
} catch (error) {
  translate();
  showError(error);
  $('busy').hidden = true;
}
