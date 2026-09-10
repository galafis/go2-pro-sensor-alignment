# Integration · Integração

## English

This repository runs independently. Related project: [go2-pro-telemetry-replay](https://github.com/galafis/go2-pro-telemetry-replay). A shared research purpose does not imply a shared wire protocol or live device connection. Keep units, coordinate frames, timing and provenance explicit when comparing reports.

## Português

Este repositório funciona de forma independente. Projeto relacionado: [go2-pro-telemetry-replay](https://github.com/galafis/go2-pro-telemetry-replay). Um objetivo de pesquisa comum não implica protocolo compartilhado ou conexão ao vivo com dispositivos. Preserve unidades, sistemas de coordenadas, tempos e origem dos dados ao comparar relatórios.

## Reusable function · Função reutilizável

```js
import { run } from './src/engine.js';
const report = run(scenario);
```

English: `scenario` must satisfy the documented data contract. The function returns a new report without mutating the input. `run` is the validated public entry point; lower-level exported mathematical helpers assume their inputs have already been checked.

Português: `scenario` deve atender ao contrato de dados documentado. A função retorna novo relatório sem alterar a entrada. `run` é a entrada pública validada; funções matemáticas auxiliares exportadas pressupõem entradas já verificadas.
