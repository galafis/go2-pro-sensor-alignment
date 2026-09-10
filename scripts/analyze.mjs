import { readFile, writeFile } from 'node:fs/promises';
import { run } from '../src/engine.js';
const [inputPath, outputPath, ...rest] = process.argv.slice(2);
try {
  if (!inputPath || rest.length)
    throw new Error('Usage / Uso: node scripts/analyze.mjs <scenario.json> [report.json]');
  const text = await readFile(inputPath, 'utf8');
  if (Buffer.byteLength(text) > 1000000) throw new Error('Maximum input / Entrada máxima: 1 MB');
  const result = await run(JSON.parse(text));
  const output = JSON.stringify(result, null, 2) + '\n';
  if (outputPath) await writeFile(outputPath, output, 'utf8');
  else process.stdout.write(output);
  if (result.status === 'review-required') process.exitCode = 2;
} catch (error) {
  console.error(
    JSON.stringify({
      error: error.code || 'INPUT',
      message: error.localized || { en: error.message, pt: error.message },
    }),
  );
  process.exitCode = 1;
}
