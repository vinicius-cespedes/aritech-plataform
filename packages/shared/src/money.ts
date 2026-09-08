/**
 * Money / arredondamento monetário — implementação única e centralizada da
 * política definida em docs/adr/ADR-007-financial-amounts-and-rounding.md.
 *
 * Regras que este módulo aplica (e que NENHUM outro lugar do código deve
 * reimplementar com `Math.round()`, `toFixed()` ou aritmética `number`):
 *
 * - Representação decimal exata (nunca float/double) — usamos decimal.js.
 * - Escala persistida: 4 casas decimais (NUMERIC(19,4) no Postgres).
 * - Arredondamento padrão: ROUND_HALF_EVEN ("banker's rounding").
 * - Parcelamento: soma das parcelas == valor original; resíduo na última parcela.
 * - Rateio percentual: soma das alocações == valor original; resíduo pelo
 *   método do maior resto quando o parcelamento simples não se aplica.
 * - Fronteira da API: valores monetários trafegam como string decimal
 *   ("12345.6700"), nunca como `number`.
 */

import { Decimal as DecimalBase } from "decimal.js";

// Clone isolado para não afetar a configuração global de decimal.js usada por
// outras bibliotecas do processo.
export const MoneyDecimal = DecimalBase.clone({
  precision: 40,
  rounding: DecimalBase.ROUND_HALF_EVEN,
});

export type DecimalInput = string | number | DecimalBase;

/** Escala (casas decimais) persistida para valores monetários — ADR-007 §3. */
export const MONETARY_SCALE = 4;

/**
 * Escala da subunidade real de cada moeda (ex.: centavos = 2 casas para BRL).
 * A escala de PERSISTÊNCIA (MONETARY_SCALE = 4) existe para dar precisão extra
 * a cálculos intermediários (rateios, percentuais, juros — ADR-007 §3/§10),
 * mas qualquer valor que efetivamente circula como dinheiro (parcela, alocação
 * de pagamento/recebimento) deve ser múltiplo da subunidade real da moeda —
 * senão "R$ 33,3333" seria uma parcela impagável.
 */
const CURRENCY_MINOR_UNIT_SCALE: Record<CurrencyCode, number> = {
  BRL: 2,
  USD: 2,
  EUR: 2,
};

/** Regex de validação de entrada decimal na fronteira da API — ADR-007 §30. */
const API_DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

export type CurrencyCode = "BRL" | "USD" | "EUR";

export class CurrencyMismatchError extends Error {
  constructor(a: CurrencyCode, b: CurrencyCode) {
    super(`CURRENCY_MISMATCH: não é possível operar ${a} com ${b} sem conversão explícita.`);
    this.name = "CurrencyMismatchError";
  }
}

export class InvalidDecimalInputError extends Error {
  constructor(value: unknown) {
    super(
      `Valor decimal inválido na fronteira da API: ${JSON.stringify(
        value,
      )}. Use string decimal com ponto, ex.: "10000.25".`,
    );
    this.name = "InvalidDecimalInputError";
  }
}

/**
 * Objeto de valor Money — FINANCIAL_MODEL.md §34.1.
 * Imutável: toda operação retorna uma nova instância.
 */
export class Money {
  private readonly value: DecimalBase;
  public readonly currency: CurrencyCode;

  private constructor(value: DecimalBase, currency: CurrencyCode) {
    this.value = value;
    this.currency = currency;
  }

  static of(amount: DecimalInput, currency: CurrencyCode = "BRL"): Money {
    return new Money(new MoneyDecimal(amount), currency);
  }

  static zero(currency: CurrencyCode = "BRL"): Money {
    return new Money(new MoneyDecimal(0), currency);
  }

  /** Parseia um valor recebido pela API (string decimal). Rejeita formatos localizados. */
  static fromApiString(raw: string, currency: CurrencyCode = "BRL"): Money {
    if (typeof raw !== "string" || !API_DECIMAL_PATTERN.test(raw.trim())) {
      throw new InvalidDecimalInputError(raw);
    }
    return Money.of(raw, currency);
  }

  /** Serializa para a fronteira da API — sempre string com a escala monetária padrão. */
  toApiString(): string {
    return this.round().value.toFixed(MONETARY_SCALE);
  }

  toDecimal(): DecimalBase {
    return this.value;
  }

  toNumber(): number {
    // Uso permitido apenas para exibição/telemetria — nunca para cálculo financeiro.
    return this.value.toNumber();
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.value.plus(other.value), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.value.minus(other.value), this.currency);
  }

  /** Multiplica por um fator adimensional (ex.: quantidade) — não por outro Money. */
  multiply(factor: DecimalInput): Money {
    return new Money(this.value.times(factor), this.currency);
  }

  /**
   * Calcula um percentual do valor (ex.: 6,15% => percentage("6.15")).
   * O arredondamento final segue a política padrão (ROUND_HALF_EVEN) — ADR-007 §17.
   */
  percentage(percent: DecimalInput): Money {
    const factor = new MoneyDecimal(percent).dividedBy(100);
    return new Money(this.value.times(factor), this.currency);
  }

  /** Arredonda para a escala monetária padrão usando ROUND_HALF_EVEN. */
  round(): Money {
    return new Money(this.value.toDecimalPlaces(MONETARY_SCALE, MoneyDecimal.ROUND_HALF_EVEN), this.currency);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  isNegative(): boolean {
    return this.value.isNegative();
  }

  isPositive(): boolean {
    return this.value.isPositive();
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.greaterThan(other.value);
  }

  greaterThanOrEqualTo(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.greaterThanOrEqualTo(other.value);
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.lessThan(other.value);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.value.equals(other.value);
  }

  /**
   * Parcelamento — ADR-007 §11-13.
   * Divide o valor em `count` parcelas iguais, aplicando o resíduo residual à
   * ÚLTIMA parcela, de forma que `sum(result) === this` exatamente.
   *
   * Exemplo: Money(100).allocateEqually(3) => [33.33, 33.33, 33.34]
   */
  allocateEqually(count: number): Money[] {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("allocateEqually: 'count' deve ser um inteiro positivo.");
    }
    const scale = CURRENCY_MINOR_UNIT_SCALE[this.currency];
    const base = this.value.dividedBy(count).toDecimalPlaces(scale, MoneyDecimal.ROUND_DOWN);
    const installments = new Array<DecimalBase>(count).fill(base);
    const allocatedSoFar = base.times(count);
    const residual = this.value.minus(allocatedSoFar);
    installments[count - 1] = installments[count - 1]!.plus(residual);
    return installments.map((v) => new Money(v, this.currency));
  }

  /**
   * Rateio percentual — ADR-007 §14-15 (método do maior resto).
   * `weights` são pesos relativos (não precisam somar 100); o resultado
   * preserva `sum(result) === this` exatamente.
   */
  allocateByWeights(weights: DecimalInput[]): Money[] {
    if (weights.length === 0) {
      throw new Error("allocateByWeights: é necessário informar ao menos um peso.");
    }
    const decimalWeights = weights.map((w) => new MoneyDecimal(w));
    const totalWeight = decimalWeights.reduce((sum, w) => sum.plus(w), new MoneyDecimal(0));
    if (totalWeight.isZero()) {
      throw new Error("allocateByWeights: a soma dos pesos não pode ser zero.");
    }

    const scale = CURRENCY_MINOR_UNIT_SCALE[this.currency];

    // 1) valor teórico de cada item com precisão ampliada
    const theoretical = decimalWeights.map((w) => this.value.times(w).dividedBy(totalWeight));
    // 2) arredonda cada parcela para a escala monetária (subunidade real da moeda)
    const rounded = theoretical.map((t) => t.toDecimalPlaces(scale, MoneyDecimal.ROUND_HALF_EVEN));
    // 3) diferença entre a soma arredondada e o total original
    const roundedSum = rounded.reduce((sum, v) => sum.plus(v), new MoneyDecimal(0));
    let residual = this.value.minus(roundedSum);

    // 4) distribui o resíduo pelo método do maior resto (maiores frações primeiro)
    const smallestUnit = new MoneyDecimal(1).dividedBy(new MoneyDecimal(10).pow(scale));
    if (!residual.isZero()) {
      const remainders = theoretical.map((t, index) => ({
        index,
        remainder: t.minus(rounded[index]!).abs(),
      }));
      remainders.sort((a, b) => b.remainder.comparedTo(a.remainder));

      const steps = residual.dividedBy(smallestUnit).toDecimalPlaces(0, MoneyDecimal.ROUND_HALF_EVEN).abs().toNumber();
      const direction = residual.isNegative() ? -1 : 1;
      for (let i = 0; i < steps; i += 1) {
        const target = remainders[i % remainders.length]!.index;
        rounded[target] = rounded[target]!.plus(smallestUnit.times(direction));
      }
      residual = new MoneyDecimal(0);
    }

    return rounded.map((v) => new Money(v, this.currency));
  }
}

/** Reexportado para consumidores que precisem do tipo Decimal diretamente. */
export type { DecimalBase as Decimal };
