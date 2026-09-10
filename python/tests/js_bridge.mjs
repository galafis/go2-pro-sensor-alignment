import { readFileSync } from 'node:fs';
import { run } from '../../src/engine.js';
process.stdout.write(JSON.stringify(await run(JSON.parse(readFileSync(process.argv[2], 'utf8')))));
