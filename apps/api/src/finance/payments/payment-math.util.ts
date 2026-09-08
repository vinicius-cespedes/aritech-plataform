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
 *   principal + desconto + retenção — juros/multa são encargos adicionais que
 *   não fazem parte do valor de face da parcela; desconto/retenção abatem o
 *   valor devido mesmo sem representar caixa.
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

  const debtReduction = components.principalAmount.add(components.discountAmount).add(components.withholdingAmount);

  return { cashAmount, debtReduction };
}
