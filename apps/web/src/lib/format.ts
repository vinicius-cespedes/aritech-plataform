/**
 * Formatação de valores monetários — ADR-007 §31-32.
 * O frontend NUNCA calcula com esses valores (só formata/converte); a
 * autoridade final é sempre o backend.
 */

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

/** Recebe uma string decimal da API ("12345.6700") e formata como "R$ 12.345,67". */
export function formatMoney(apiValue: string | number | null | undefined): string {
  if (apiValue === null || apiValue === undefined) return "—";
  const value = typeof apiValue === "string" ? Number.parseFloat(apiValue) : apiValue;
  if (Number.isNaN(value)) return "—";
  return BRL_FORMATTER.format(value);
}

/** Converte uma entrada localizada do usuário ("1.234,56") para string decimal da API ("1234.56"). */
export function parseMoneyInput(localValue: string): string {
  const cleaned = localValue.trim().replace(/\./g, "").replace(",", ".");
  return cleaned === "" ? "0" : cleaned;
}

export function formatDate(isoValue: string | null | undefined): string {
  if (!isoValue) return "—";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMATTER.format(date);
}

/** Converte uma data "yyyy-mm-dd" de um <input type="date"> para o formato ISO esperado pela API. */
export function toIsoDate(inputValue: string): string {
  return inputValue;
}
