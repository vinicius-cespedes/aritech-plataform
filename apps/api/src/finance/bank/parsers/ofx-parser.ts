/**
 * Parser de OFX — ADR-009 §4-5, §87-88.
 *
 * O domínio não deve depender do formato OFX diretamente (ADR-009 §104): este
 * parser vive na camada de infraestrutura e converte o arquivo em um modelo
 * normalizado (`NormalizedOfxStatement`) consumido pelo serviço de importação.
 *
 * OFX "clássico" (versão 1.x, SGML) é o formato mais comum entre bancos
 * brasileiros: possui um cabeçalho de linhas "CHAVE:VALOR" seguido de um corpo
 * parecido com XML, mas nem sempre com tags de fechamento em elementos-folha
 * (ex.: "<NAME>Fulano" sem "</NAME>"). Este parser é tolerante a esse formato,
 * mas também funciona com OFX 2.x (XML estrito), já que a extração é feita
 * por regex sobre pares de tag, não por um parser XML rígido.
 */

export interface NormalizedOfxTransaction {
  fitId: string | null;
  transactionDate: Date;
  postingDate: Date | null;
  amount: string; // valor absoluto, como string decimal — ADR-007 §29
  direction: "CREDIT" | "DEBIT";
  description: string | null;
  documentNumber: string | null;
  counterpartyName: string | null;
  bankReference: string | null;
}

export interface NormalizedOfxStatement {
  bankId: string | null;
  accountId: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  transactions: NormalizedOfxTransaction[];
}

function extractTag(block: string, tag: string): string | null {
  // Aceita tanto "<TAG>valor</TAG>" (XML) quanto "<TAG>valor" sem fechamento (SGML).
  const closed = new RegExp(`<${tag}>([^<\\r\\n]*)</${tag}>`, "i").exec(block);
  if (closed) return closed[1]!.trim();
  const open = new RegExp(`<${tag}>([^<\\r\\n]*)`, "i").exec(block);
  return open ? open[1]!.trim() : null;
}

/**
 * Valor monetário do OFX (TRNAMT/BALAMT). A especificação exige ponto como
 * separador decimal e nenhum separador de milhar, mas na prática vários
 * bancos brasileiros (Santander entre eles) exportam OFX com vírgula
 * decimal (ex.: "-1125,00" ou "-1.125,00") — este parser tolera ambos os
 * formatos em vez de exigir estritamente o padrão OFX.
 */
function parseOfxAmount(raw: string): number {
  const trimmed = raw.trim();

  const hasComma = trimmed.includes(",");
  const hasDot = trimmed.includes(".");

  let normalized = trimmed;
  if (hasComma && hasDot) {
    // Ambos presentes: o separador que aparece por último é o decimal; o outro é de milhar.
    normalized =
      trimmed.lastIndexOf(",") > trimmed.lastIndexOf(".")
        ? trimmed.replace(/\./g, "").replace(",", ".")
        : trimmed.replace(/,/g, "");
  } else if (hasComma) {
    // Só vírgula: trata como decimal (formato pt-BR não conforme ao padrão OFX).
    normalized = trimmed.replace(",", ".");
  }

  return Number(normalized);
}

/** Datas OFX vêm como "YYYYMMDD" ou "YYYYMMDDHHMMSS[.xxx][zona]". */
function parseOfxDate(raw: string | null): Date | null {
  if (!raw) return null;
  const match = /^(\d{4})(\d{2})(\d{2})/.exec(raw.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export class OfxParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfxParseError";
  }
}

export function parseOfx(rawContent: string): NormalizedOfxStatement {
  const body = rawContent.includes("<OFX>") ? rawContent.slice(rawContent.indexOf("<OFX>")) : rawContent;
  if (!body.includes("<OFX>")) {
    throw new OfxParseError("Arquivo não parece ser um OFX válido (tag <OFX> não encontrada).");
  }

  const bankId = extractTag(body, "BANKID");
  const accountId = extractTag(body, "ACCTID");
  const periodStart = parseOfxDate(extractTag(body, "DTSTART"));
  const periodEnd = parseOfxDate(extractTag(body, "DTEND"));

  const transactionBlocks = body.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) ?? [];
  if (transactionBlocks.length === 0) {
    throw new OfxParseError("Nenhuma transação (<STMTTRN>) encontrada no arquivo OFX.");
  }

  const transactions: NormalizedOfxTransaction[] = transactionBlocks.map((block, index) => {
    const trnType = extractTag(block, "TRNTYPE");
    const amountRaw = extractTag(block, "TRNAMT");
    const dtPosted = extractTag(block, "DTPOSTED");

    if (!amountRaw) {
      throw new OfxParseError(`Transação #${index + 1} sem TRNAMT.`);
    }
    const amountNumber = parseOfxAmount(amountRaw);
    if (Number.isNaN(amountNumber)) {
      throw new OfxParseError(`Transação #${index + 1} com TRNAMT inválido: "${amountRaw}".`);
    }

    const transactionDate = parseOfxDate(dtPosted);
    if (!transactionDate) {
      throw new OfxParseError(`Transação #${index + 1} sem DTPOSTED válido.`);
    }

    // ADR-009 §13 — valor sempre positivo; direção separada.
    const direction: "CREDIT" | "DEBIT" =
      amountNumber >= 0 ? "CREDIT" : trnType?.toUpperCase() === "CREDIT" ? "CREDIT" : "DEBIT";

    return {
      fitId: extractTag(block, "FITID"),
      transactionDate,
      postingDate: transactionDate,
      amount: Math.abs(amountNumber).toFixed(4),
      direction,
      description: extractTag(block, "MEMO") ?? extractTag(block, "NAME"),
      documentNumber: extractTag(block, "CHECKNUM"),
      counterpartyName: extractTag(block, "NAME"),
      bankReference: extractTag(block, "REFNUM"),
    };
  });

  return { bankId, accountId, periodStart, periodEnd, transactions };
}
