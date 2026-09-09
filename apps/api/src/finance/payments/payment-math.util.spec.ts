import { Money } from "@aritech/shared";
import { computeAllocationAmounts } from "./payment-math.util";

function money(value: string) {
  return Money.of(value);
}

describe("computeAllocationAmounts", () => {
  it("pagamento simples: só principal, sem encargos", () => {
    const { cashAmount, debtReduction } = computeAllocationAmounts({
      principalAmount: money("100"),
      interestAmount: money("0"),
      penaltyAmount: money("0"),
      discountAmount: money("0"),
      withholdingAmount: money("0"),
    });
    expect(cashAmount.toApiString()).toBe("100.0000");
    expect(debtReduction.toApiString()).toBe("100.0000");
  });

  it("docx §10: valor de caixa = principal + juros + multa - desconto", () => {
    const { cashAmount } = computeAllocationAmounts({
      principalAmount: money("1000"),
      interestAmount: money("50"),
      penaltyAmount: money("20"),
      discountAmount: money("30"),
      withholdingAmount: money("0"),
    });
    // 1000 + 50 + 20 - 30 = 1040
    expect(cashAmount.toApiString()).toBe("1040.0000");
  });

  it("ADR-009 §46: retenção reduz o caixa, mas a parcela é liquidada pelo valor de principal (exemplo do documento)", () => {
    // Receivable bruto 100.000, retenção 6.150, recebido em banco 93.850,
    // Receivable settled = 100.000 (a retenção é uma fração do principal,
    // não um valor adicional ao que precisa ser abatido da parcela).
    const { cashAmount, debtReduction } = computeAllocationAmounts({
      principalAmount: money("100000"),
      interestAmount: money("0"),
      penaltyAmount: money("0"),
      discountAmount: money("0"),
      withholdingAmount: money("6150"),
    });
    expect(cashAmount.toApiString()).toBe("93850.0000");
    expect(debtReduction.toApiString()).toBe("100000.0000");
  });

  it("desconto reduz tanto o caixa quanto o saldo devedor", () => {
    const { cashAmount, debtReduction } = computeAllocationAmounts({
      principalAmount: money("500"),
      interestAmount: money("0"),
      penaltyAmount: money("0"),
      discountAmount: money("50"),
      withholdingAmount: money("0"),
    });
    expect(cashAmount.toApiString()).toBe("450.0000");
    expect(debtReduction.toApiString()).toBe("550.0000");
  });
});
