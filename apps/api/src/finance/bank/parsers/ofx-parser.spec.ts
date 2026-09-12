import { OfxParseError, parseOfx } from "./ofx-parser";

function buildOfx(trnamt: string): string {
  return `
OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<DTSTART>20260901
<DTEND>20260930
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260910
<TRNAMT>${trnamt}
<FITID>1
<NAME>Fornecedor Exemplo
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTRNRS>
</BANKMSGSRSV1>
</OFX>
`;
}

describe("parseOfx — TRNAMT com separador decimal não conforme (bancos BR)", () => {
  it("aceita ponto decimal (padrão OFX)", () => {
    const result = parseOfx(buildOfx("-1125.00"));
    expect(result.transactions[0]!.amount).toBe("1125.0000");
    expect(result.transactions[0]!.direction).toBe("DEBIT");
  });

  it("aceita vírgula decimal (ex.: Santander) — regressão do bug reportado", () => {
    const result = parseOfx(buildOfx("-1125,00"));
    expect(result.transactions[0]!.amount).toBe("1125.0000");
    expect(result.transactions[0]!.direction).toBe("DEBIT");
  });

  it("aceita milhar com ponto e decimal com vírgula", () => {
    const result = parseOfx(buildOfx("-1.125,50"));
    expect(result.transactions[0]!.amount).toBe("1125.5000");
  });

  it("aceita milhar com vírgula e decimal com ponto", () => {
    const result = parseOfx(buildOfx("1,125.50"));
    expect(result.transactions[0]!.amount).toBe("1125.5000");
    expect(result.transactions[0]!.direction).toBe("CREDIT");
  });

  it("rejeita valor que não é numérico em nenhum formato", () => {
    expect(() => parseOfx(buildOfx("abc"))).toThrow(OfxParseError);
  });
});
