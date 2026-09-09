import { confidenceLevel, scoreCandidate } from "./reconciliation-matching.util";

describe("scoreCandidate — motor de sugestão de conciliação (ADR-009 §33)", () => {
  it("valor exato + data exata + contraparte compatível => alta confiança", () => {
    const { score, criteria } = scoreCandidate({
      targetAmount: 33.33,
      targetDate: new Date("2026-09-09"),
      bankAmount: 33.33,
      bankDate: new Date("2026-09-09"),
      targetCounterpartyName: "Fornecedor Teste Ltda",
      bankCounterpartyName: "Fornecedor Teste Ltda",
    });
    expect(score).toBe(80);
    expect(confidenceLevel(score)).toBe("MEDIUM");
    expect(criteria).toEqual(["EXACT_AMOUNT", "DATE_EXACT", "COUNTERPARTY_NAME_MATCH"]);
  });

  it("valor divergente não gera sugestão (ADR-009 §43-44 — exige valor exato no MVP)", () => {
    const { score, criteria } = scoreCandidate({
      targetAmount: 100,
      targetDate: new Date("2026-09-09"),
      bankAmount: 100.05,
      bankDate: new Date("2026-09-09"),
    });
    expect(score).toBe(0);
    expect(criteria).toEqual([]);
  });

  it("data fora da janela de 15 dias (docx §13.2) não gera sugestão", () => {
    const { score } = scoreCandidate({
      targetAmount: 100,
      targetDate: new Date("2026-09-01"),
      bankAmount: 100,
      bankDate: new Date("2026-09-20"),
    });
    expect(score).toBe(0);
  });

  it("data dentro da janela, sem contraparte, ainda gera sugestão de confiança menor", () => {
    const { score, criteria } = scoreCandidate({
      targetAmount: 100,
      targetDate: new Date("2026-09-01"),
      bankAmount: 100,
      bankDate: new Date("2026-09-10"),
    });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(80);
    expect(criteria).toContain("EXACT_AMOUNT");
    expect(criteria).not.toContain("COUNTERPARTY_NAME_MATCH");
  });

  it("classifica faixas de confiança conforme ADR-009 §35", () => {
    expect(confidenceLevel(95)).toBe("HIGH");
    expect(confidenceLevel(80)).toBe("MEDIUM");
    expect(confidenceLevel(50)).toBe("LOW");
  });
});
