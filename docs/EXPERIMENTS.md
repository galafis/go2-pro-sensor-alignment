# Worked experiments · Experimentos comentados

[README](../README.md)

## English

The nominal square is rotated 90° and translated by [3, 2] m. The fit recovers that transform with zero rounded residual. The evaluation point [1, 1] maps to [2, 3]. Perturbing one landmark exposes both fitted and held-out error; lowering its explicit weight changes the fit but does not erase that landmark's residual.

For each experiment below, run the command and compare the JSON with the committed expected report. Change one assumption at a time; keep the original input as a separate file. Status is an interpretation of this model, not physical approval.

## Português

O quadrado nominal é rotacionado 90° e transladado por [3, 2] m. O ajuste recupera essa transformação com resíduo arredondado zero. O ponto de avaliação [1, 1] passa a [2, 3]. Perturbar um marco evidencia erro ajustado e de exclusão; reduzir seu peso explícito altera o ajuste, mas não apaga o resíduo desse marco.

Em cada experimento abaixo, execute o comando e compare o JSON com o relatório esperado versionado. Altere uma hipótese por vez e preserve a entrada original em arquivo separado. O estado é uma interpretação deste modelo, não aprovação física.

## Known rotation and translation · Rotação e translação conhecidas

```sh
node scripts/analyze.mjs examples/nominal.json experiment.report.json
```

[Input / Entrada](../examples/nominal.json) · [Expected / Esperado](../examples/nominal.report.json) · `complete`

| Metric · Métrica                                         | Expected value · Valor esperado |
| -------------------------------------------------------- | ------------------------------- |
| Fitted rotation / Rotação ajustada                       | 90 °                            |
| Weighted fit RMSE / RMSE ponderado do ajuste             | 0 m                             |
| Maximum fitted residual / Maior resíduo do ajuste        | 0 m                             |
| Maximum held-out residual / Maior resíduo fora do ajuste | 0 m                             |

## Small observation perturbation · Pequena perturbação da observação

```sh
node scripts/analyze.mjs examples/noise.json experiment.report.json
```

[Input / Entrada](../examples/noise.json) · [Expected / Esperado](../examples/noise.report.json) · `complete`

| Metric · Métrica                                         | Expected value · Valor esperado |
| -------------------------------------------------------- | ------------------------------- |
| Fitted rotation / Rotação ajustada                       | 89.421274 °                     |
| Weighted fit RMSE / RMSE ponderado do ajuste             | 0.031591 m                      |
| Maximum fitted residual / Maior resíduo do ajuste        | 0.050851 m                      |
| Maximum held-out residual / Maior resíduo fora do ajuste | 0.08 m                          |

## Mismatched landmark · Correspondência incorreta

```sh
node scripts/analyze.mjs examples/outlier.json experiment.report.json
```

[Input / Entrada](../examples/outlier.json) · [Expected / Esperado](../examples/outlier.report.json) · `review-notes`

| Metric · Métrica                                         | Expected value · Valor esperado |
| -------------------------------------------------------- | ------------------------------- |
| Fitted rotation / Rotação ajustada                       | 81.869898 °                     |
| Weighted fit RMSE / RMSE ponderado do ajuste             | 0.389828 m                      |
| Maximum fitted residual / Maior resíduo do ajuste        | 0.612776 m                      |
| Maximum held-out residual / Maior resíduo fora do ajuste | 1 m                             |

- `FIT_RESIDUAL`: At least one fitted residual exceeds the review threshold. / Ao menos um resíduo do ajuste excede o limiar de revisão.
- `HELD_OUT_RESIDUAL`: A held-out residual exceeds the review threshold. / Um resíduo fora do ajuste excede o limiar de revisão.

## Explicit lower weight · Peso menor explícito

```sh
node scripts/analyze.mjs examples/weighted.json experiment.report.json
```

[Input / Entrada](../examples/weighted.json) · [Expected / Esperado](../examples/weighted.report.json) · `review-notes`

| Metric · Métrica                                         | Expected value · Valor esperado |
| -------------------------------------------------------- | ------------------------------- |
| Fitted rotation / Rotação ajustada                       | 89.857827 °                     |
| Weighted fit RMSE / RMSE ponderado do ajuste             | 0.057448 m                      |
| Maximum fitted residual / Maior resíduo do ajuste        | 0.993382 m                      |
| Maximum held-out residual / Maior resíduo fora do ajuste | 1 m                             |

- `FIT_RESIDUAL`: At least one fitted residual exceeds the review threshold. / Ao menos um resíduo do ajuste excede o limiar de revisão.
- `HELD_OUT_RESIDUAL`: A held-out residual exceeds the review threshold. / Um resíduo fora do ajuste excede o limiar de revisão.

## Minimum two correspondences · Mínimo de duas correspondências

```sh
node scripts/analyze.mjs examples/minimal.json experiment.report.json
```

[Input / Entrada](../examples/minimal.json) · [Expected / Esperado](../examples/minimal.report.json) · `review-notes`

| Metric · Métrica                                         | Expected value · Valor esperado |
| -------------------------------------------------------- | ------------------------------- |
| Fitted rotation / Rotação ajustada                       | 90 °                            |
| Weighted fit RMSE / RMSE ponderado do ajuste             | 0 m                             |
| Maximum fitted residual / Maior resíduo do ajuste        | 0 m                             |
| Maximum held-out residual / Maior resíduo fora do ajuste | null m                          |

- `HELD_OUT_UNAVAILABLE`: Some held-out fits are unavailable; inspect their status. / Alguns ajustes de exclusão estão indisponíveis; inspecione seus estados.
