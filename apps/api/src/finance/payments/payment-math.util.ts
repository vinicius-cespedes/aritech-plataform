import { Money } from "@aritech/shared";

export interface AllocationComponents {
  principalAmount: Money;
  interestAmount: Money;
  penaltyAmount: Money;
  discountAmount: Money;
  withholdingAmount: Money;
}

/**
 * Regras de cálculo de uma alocação de pagamento/recebimento — docx §10 e
 * FINANCIAL_MODEL §9/§13.
 *
 * - `cashAmount` (o que efetivamente circula no banco) = principal + juros +
 *   multa - desconto - retenção (docx §10: "Valor de caixa = principal +
 *   juros + multa - desconto").
 * - `debtReduction` (quanto do saldo em aberto da parcela é abatido) =
 *   principal + desconto. A retenção NÃO soma aqui: ela é uma fração do
 *   próprio principal que não vira caixa, não um valor adicional — ADR-009
 *   §46 ("Receivable bruto 100.000, retenção 6.150, banco 93.850,
 *   Receivable settled = 100.000"): a parcela é liquidada pelo valor de
 *   principal informado (100.000), e a retenção só afeta quanto disso chega
 *   de fato ao banco. Juros/multa são encargos adicionais que não fazem
 *   parte do valor de face da parcela; desconto abate o valor devido mesmo
 *   sem representar caixa.
 *
 * Simplificação assumida nesta primeira iteração (documentada para revisão
 * futura junto de FINANCIAL_MODEL.md, que deixa juros/renegociação como
 * "decisão pendente").
 */
export function computeAllocationAmounts(components: AllocationComponents): {
  cashAmount: Money;
  debtReduction: Money;
} {
  const cashAmount = components.principalAmount
    .add(components.interestAmount)
    .add(components.penaltyAmount)
    .subtract(components.discountAmount)
    .subtract(components.withholdingAmount);

  const debtReduction = components.principalAmount.add(components.discountAmount);

  return { cashAmount, debtReduction };
}
