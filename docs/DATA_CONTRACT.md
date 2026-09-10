# Data contract · Contrato de dados

[README](../README.md) · [JSON Schema](../schemas/scenario.schema.json)

## Envelope

| Field · Campo   | Contract · Contrato                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion` | Exactly 1 / Exatamente 1                                                                                                                                                      |
| `scenarioId`    | 1–64 lowercase letters, digits, dashes or underscores; first character alphanumeric / 1–64 letras minúsculas, dígitos, hífens ou sublinhados; primeiro caractere alfanumérico |
| `source`        | `synthetic` or `manual`; manual is not verified measurement provenance / `synthetic` ou `manual`; manual não comprova origem medida                                           |

## Domain fields · Campos do domínio

| Field · Campo      | English                                                                                          | Português                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `maxResidualM`     | Review threshold applied to fitted and available held-out residuals.                             | Limiar de revisão aplicado a resíduos ajustados e de exclusão disponíveis.                       |
| `pairs`            | 2–200 unique ids with observed [x,y], reference [x,y] in meters and positive weight.             | 2–200 ids únicos com observed [x,y], reference [x,y] em metros e peso positivo.                  |
| `evaluationPoints` | 0–1,000 observed-frame points to transform after fitting; they do not participate in estimation. | 0–1.000 pontos do sistema observado para transformar após o ajuste; não participam da estimação. |

## Nested fields and bounds · Campos aninhados e limites

| Path · Caminho      | Type / bounds · Tipo / limites |
| ------------------- | ------------------------------ |
| `schemaVersion`     | constant 1                     |
| `scenarioId`        | string                         |
| `source`            | synthetic / manual             |
| `maxResidualM`      | number [0.001, 100]            |
| `pairs`             | array [2–200 items / itens]    |
| `pairs[].id`        | string                         |
| `pairs[].observed`  | array [2–2 items / itens]      |
| `pairs[].reference` | array [2–2 items / itens]      |
| `pairs[].weight`    | number [0.001, 1000]           |
| `evaluationPoints`  | array [0–1000 items / itens]   |

## Semantic checks · Verificações semânticas

English: The schema checks shape and scalar bounds. The engine additionally checks relationships such as unique identities, references, geometry consistency, non-overlapping windows or non-degenerate fits, as applicable. Unknown fields are rejected at object boundaries. Numbers must be finite. Validation occurs before analysis and imported inputs are limited to 1 MB in both interfaces.

Português: O esquema verifica estrutura e limites escalares. O mecanismo também verifica relações como identidades únicas, referências, consistência geométrica, janelas sem sobreposição ou ajustes não degenerados, conforme o domínio. Campos desconhecidos são rejeitados nos objetos. Números devem ser finitos. A validação ocorre antes da análise e entradas importadas são limitadas a 1 MB em ambas as interfaces.

## Report · Relatório

`schemaVersion`, `analysisVersion`, `projectId`, `scenarioId`, `source`, `status`, `metrics`, `findings` and `records` form the shared envelope. Project-specific fields retain the detailed calculation. Numeric results are exported as numbers; localization affects only display. Many presentation values are rounded to six decimal places; a rounded zero does not establish exact physical agreement.

`schemaVersion`, `analysisVersion`, `projectId`, `scenarioId`, `source`, `status`, `metrics`, `findings` e `records` formam o envelope comum. Campos específicos preservam o cálculo detalhado. Resultados numéricos são exportados como números; localização afeta apenas a exibição. Muitos valores de apresentação são arredondados a seis casas decimais; zero arredondado não comprova concordância física exata.

| Status                           | Meaning · Significado                                               | CLI exit · Saída |
| -------------------------------- | ------------------------------------------------------------------- | ---------------- |
| `complete`                       | No model findings / Sem achados no modelo                           | 0                |
| `review-notes`                   | Informational or warning findings / Informações ou avisos           | 0                |
| `review-required`                | At least one error-level finding / Ao menos um achado de nível erro | 2                |
| Invalid input / Entrada inválida | No new report / Sem novo relatório                                  | 1                |
