# Validation evidence · Evidências de validação

The suite currently contains **27 tests**. Five replay committed scenarios; the remaining tests check domain answers, edge cases and interface contracts. / A suíte contém **27 testes**. Cinco reproduzem cenários versionados; os demais verificam respostas do domínio, casos extremos e contratos das interfaces.

```sh
npm test
npm run examples
npm run test:coverage
```

GitHub Checks executes the suite on Linux and Windows with Node.js 22 and 24. Coverage reports measure executed source paths; they do not establish correctness or physical readiness. / O GitHub Checks executa a suíte no Linux e Windows com Node.js 22 e 24. Relatórios de cobertura medem caminhos de código executados; não comprovam correção ou prontidão física.

## Executable checks · Verificações executáveis

### [alignment.test.js](../test/alignment.test.js)

- known quarter turn and translation are recovered
- evaluation points use the fitted transform
- identity transform remains identity
- many known rigid transforms recover orientation and translation
- global weight scaling leaves the fit unchanged
- two distinct correspondences determine a 2D rigid fit
- coincident observed points are rejected as degenerate
- coincident reference points are rejected as degenerate
- outlier increases fitted and held-out residuals
- fixed scale does not silently fit a scaled point cloud
- reflection is not accepted as a zero-residual rigid fit
- held-out degeneracy is exposed instead of silently dropping the point
- negative weights and duplicate landmark identities are rejected
- large common coordinate offset does not destroy a well-spread fit

### [contracts.test.js](../test/contracts.test.js)

- reproducible example:
- analysis preserves inputs and repeated runs are identical
- report preserves source and version without runtime timestamps
- unsupported versions, unknown fields and invalid provenance are rejected
- non-finite primary values are rejected
- bilingual chart renders data without non-finite coordinates
- primary input default aligns with native numeric stepping
- CLI writes the same report as the domain engine
- CLI rejects invalid input without creating a success report

## Reading the evidence · Como interpretar a evidência

English: Known-answer checks verify independent numerical expectations. Invariant checks exercise multiple generated configurations, including unfavorable outcomes. The command-line test compares its exported report with the same validated domain calculation. Browser-render checks verify that both languages produce charts without non-finite coordinates; they do not replace interactive keyboard and layout review. No hardware, participant or emergency-use validation is claimed.

Português: Testes de resposta conhecida verificam expectativas numéricas independentes. Verificações de invariantes exercitam diversas configurações geradas, incluindo resultados desfavoráveis. O teste da linha de comando compara a exportação com o cálculo de domínio validado. Verificações dos gráficos conferem os dois idiomas e coordenadas finitas; não substituem revisão interativa de teclado e layout. Não se afirma validação em hardware, com participantes ou para emergências.
