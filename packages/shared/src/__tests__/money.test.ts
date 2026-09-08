import { describe, expect, it } from "vitest";
import { Money, MoneyDecimal } from "../money";

// Casos de teste obrigatórios — ADR-007 §40.
describe("Money — política de arredondamento (ADR-007)", () => {
  it("soma decimal exata: 0,10 + 0,20 = 0,30", () => {
    const result = Money.of("0.10").add(Money.of("0.20"));
    expect(result.toApiString()).toBe("0.3000");
  });

  it("parcelamento: 100 / 3 => 33.33, 33.33, 33.34 (resíduo na última parcela)", () => {
    const [a, b, c] = Money.of("100").allocateEqually(3);
    expect(a!.toApiString()).toBe("33.3300");
    expect(b!.toApiString()).toBe("33.3300");
    expect(c!.toApiString()).toBe("33.3400");
    const sum = a!.add(b!).add(c!);
    expect(sum.equals(Money.of("100"))).toBe(true);
  });

  it("grande valor: 999.999.999,99 é manipulado sem perda de precisão", () => {
    const value = Money.of("999999999.9900");
    expect(value.toApiString()).toBe("999999999.9900");
  });

  it("percentual: 100.000 × 6,15% = 6.150", () => {
    const result = Money.of("100000").percentage("6.15");
    expect(result.round().toApiString()).toBe("6150.0000");
  });

  it("arredondamento ROUND_HALF_EVEN (banker's rounding) em 2 casas", () => {
    expect(new MoneyDecimal("1.225").toDecimalPlaces(2, MoneyDecimal.ROUND_HALF_EVEN).toString()).toBe("1.22");
    expect(new MoneyDecimal("1.235").toDecimalPlaces(2, MoneyDecimal.ROUND_HALF_EVEN).toString()).toBe("1.24");
  });

  it("rateio por pesos: soma das alocações == valor original", () => {
    const allocations = Money.of("10000").allocateByWeights(["33.33", "33.33", "33.34"]);
    const sum = allocations.reduce((acc, m) => acc.add(m), Money.zero());
    expect(sum.equals(Money.of("10000"))).toBe(true);
  });

  it("pagamento parcial: 100.000 - 40.000 = 60.000", () => {
    const result = Money.of("100000").subtract(Money.of("40000"));
    expect(result.toApiString()).toBe("60000.0000");
  });

  it("estorno: 60.000 + 40.000 = 100.000", () => {
    const result = Money.of("60000").add(Money.of("40000"));
    expect(result.toApiString()).toBe("100000.0000");
  });

  it("rejeita entrada localizada na fronteira da API", () => {
    expect(() => Money.fromApiString("10.000,25")).toThrow();
    expect(() => Money.fromApiString("R$ 10000,25")).toThrow();
    expect(() => Money.fromApiString("abc")).toThrow();
  });

  it("aceita entrada decimal válida na fronteira da API", () => {
    expect(Money.fromApiString("10000.25").toApiString()).toBe("10000.2500");
  });

  it("impede operações aritméticas entre moedas diferentes", () => {
    expect(() => Money.of("100", "BRL").add(Money.of("100", "USD"))).toThrow();
  });
});
