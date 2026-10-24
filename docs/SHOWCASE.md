# Guided evidence tour · Visita guiada às evidências

[README](../README.md) · [Validation / Validação](../docs/VALIDATION.md)

## The question · A pergunta

**EN:** Does the fitted transform generalize to held-out landmarks?

**PT:** A transformação ajustada se mantém nos marcos excluídos do ajuste?

## First result · Primeiro resultado

Fitted rotation / RotaÃ§Ã£o ajustada: **90 Â°**; Weighted fit RMSE / RMSE ponderado do ajuste: **0 m**; Maximum fitted residual / Maior resÃ­duo do ajuste: **0 m**

**EN:** These are committed examples of software behavior. Follow the installation and execution commands in the [README](../README.md#english); the source inputs and expected outputs below allow inspection before installation.

**PT:** São exemplos versionados do comportamento do software. Siga a instalação e os comandos do [README](../README.md#portugues); as entradas e saídas abaixo permitem inspecionar o resultado antes de instalar.

## Compare one assumption · Compare uma premissa

**EN:** Compare nominal, noise and outlier examples; inspect held-out residuals before changing weights. Keep the original input, change a copy, rerun the implementation and compare the complete output, including warnings and excluded records.

**PT:** Compare nominal, ruído e valor discrepante; inspecione resíduos de exclusão antes de alterar pesos. Preserve a entrada original, altere uma cópia, execute novamente e compare a saída completa, incluindo avisos e registros excluídos.

## Inputs and expected outputs · Entradas e saídas esperadas

| Input · Entrada | Expected output · Saída esperada | Inspect · Inspecione |
| --- | --- | --- |
| [minimal.json](../examples/minimal.json) | [minimal.report.json](../examples/minimal.report.json) | Fitted rotation / RotaÃ§Ã£o ajustada: **90 Â°**; Weighted fit RMSE / RMSE ponderado do ajuste: **0 m**; Maximum fitted residual / Maior resÃ­duo do ajuste: **0 m** |
| [noise.json](../examples/noise.json) | [noise.report.json](../examples/noise.report.json) | Fitted rotation / RotaÃ§Ã£o ajustada: **89.421274 Â°**; Weighted fit RMSE / RMSE ponderado do ajuste: **0.031591 m**; Maximum fitted residual / Maior resÃ­duo do ajuste: **0.050851 m** |
| [nominal.json](../examples/nominal.json) | [nominal.report.json](../examples/nominal.report.json) | Fitted rotation / RotaÃ§Ã£o ajustada: **90 Â°**; Weighted fit RMSE / RMSE ponderado do ajuste: **0 m**; Maximum fitted residual / Maior resÃ­duo do ajuste: **0 m** |
| [outlier.json](../examples/outlier.json) | [outlier.report.json](../examples/outlier.report.json) | Fitted rotation / RotaÃ§Ã£o ajustada: **81.869898 Â°**; Weighted fit RMSE / RMSE ponderado do ajuste: **0.389828 m**; Maximum fitted residual / Maior resÃ­duo do ajuste: **0.612776 m** |
| [weighted.json](../examples/weighted.json) | [weighted.report.json](../examples/weighted.report.json) | Fitted rotation / RotaÃ§Ã£o ajustada: **89.857827 Â°**; Weighted fit RMSE / RMSE ponderado do ajuste: **0.057448 m**; Maximum fitted residual / Maior resÃ­duo do ajuste: **0.993382 m** |

## Review the evidence · Revise as evidências

1. **Input / Entrada:** identify units, identifiers and assumptions before interpreting a result. / Identifique unidades, identificadores e premissas antes de interpretar o resultado.
2. **Implementation / Implementação:** follow the domain code linked in the README. / Acompanhe o código de domínio indicado no README.
3. **Output / Saída:** compare both the headline and the complete record. / Compare o destaque e o registro completo.
4. **Checks / Verificações:** read [validation notes](../docs/VALIDATION.md) and the current workflow result. / Leia as [notas de validação](../docs/VALIDATION.md) e o resultado atual da automação.

**EN:** The banner illustrates the workflow; it is not a screenshot. Example values describe the supplied scenarios. They do not establish physical performance, institutional endorsement or an outcome beyond the documented software scope. Domain-specific assumptions and limitations remain in the README and method documents.

**PT:** O banner ilustra o fluxo; não é uma captura de tela. Os valores descrevem os cenários fornecidos. Não estabelecem desempenho físico, endosso institucional ou resultado além do escopo documentado do software. Premissas e limites do domínio permanecem no README e nos documentos de método.
