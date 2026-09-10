# Research scope · Escopo de pesquisa

## English

A weighted least-squares fit of a proper two-dimensional rigid transform. It estimates rotation and translation from paired landmarks, reports residuals and recalculates fits with each landmark held out.

The method does not estimate scale, 3D pose, time synchronization or lens distortion. It assumes correct landmark identities and a rigid planar relation. Small fitted error can be misleading with poor geometry or reused observations; held-out residuals are a diagnostic, not an independent field validation.

## Português

Um ajuste ponderado por mínimos quadrados de uma transformação rígida própria em duas dimensões. Estima rotação e translação a partir de marcos pareados, informa resíduos e recalcula ajustes excluindo cada marco.

O método não estima escala, pose 3D, sincronização temporal ou distorção de lente. Pressupõe identidades corretas dos marcos e relação plana rígida. Erro ajustado pequeno pode enganar com geometria inadequada ou observações reutilizadas; resíduos de exclusão são diagnóstico, não validação de campo independente.

[Development stages / Etapas de desenvolvimento](GO2_PRO_PLAN.md)

Independent public implementation using synthetic examples. No private Évia implementation is included or required. / Implementação pública independente com exemplos sintéticos. Nenhuma implementação privada da Évia está incluída ou é necessária.
