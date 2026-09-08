/** Converte strings simples de duração ("15m", "7d", "30s") em milissegundos. */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Formato de duração inválido: "${duration}". Use algo como "15m" ou "7d".`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const factors: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * factors[unit]!;
}
