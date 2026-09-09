/**
 * Motor de sugestão de conciliação — ADR-009 §31-35.
 * Regras determinísticas baseadas em pesos (não é machine learning no MVP).
 */

export interface MatchCandidateInput {
  targetAmount: number;
  targetDate: Date;
  bankAmount: number;
  bankDate: Date;
  targetCounterpartyName?: string | null;
  bankCounterpartyName?: string | null;
}

export interface MatchScore {
  score: number;
  criteria: string[];
}

/** Docx §13.2 — janela de data do match automático de até 15 dias (v9 da homologação). */
export const MATCH_DATE_WINDOW_DAYS = 15;

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.abs(Math.round((a.getTime() - b.getTime()) / msPerDay));
}

function namesLooselyMatch(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na.length < 3 || nb.length < 3) return false;
  return na.includes(nb) || nb.includes(na);
}

export function scoreCandidate(input: MatchCandidateInput): MatchScore {
  let score = 0;
  const criteria: string[] = [];

  // Valor exato — ADR-009 §33/§43-44: no MVP a correspondência automática
  // exige valor exato (diferenças viram tarifa/juros/desconto tratados à parte).
  if (Math.abs(input.targetAmount - input.bankAmount) < 0.005) {
    score += 50;
    criteria.push("EXACT_AMOUNT");
  } else {
    return { score: 0, criteria: [] };
  }

  const diffDays = daysBetween(input.targetDate, input.bankDate);
  if (diffDays === 0) {
    score += 20;
    criteria.push("DATE_EXACT");
  } else if (diffDays <= MATCH_DATE_WINDOW_DAYS) {
    score += Math.round(20 * (1 - diffDays / MATCH_DATE_WINDOW_DAYS));
    criteria.push(`DATE_WITHIN_${MATCH_DATE_WINDOW_DAYS}_DAYS`);
  } else {
    return { score: 0, criteria: [] };
  }

  if (namesLooselyMatch(input.targetCounterpartyName, input.bankCounterpartyName)) {
    score += 10;
    criteria.push("COUNTERPARTY_NAME_MATCH");
  }

  return { score, criteria };
}

/** ADR-009 §35 — faixas de confiança. */
export function confidenceLevel(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 90) return "HIGH";
  if (score >= 70) return "MEDIUM";
  return "LOW";
}
