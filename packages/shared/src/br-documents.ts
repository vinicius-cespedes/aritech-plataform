/**
 * Máscara e validação de CPF/CNPJ — usado tanto no frontend (formatar
 * enquanto o usuário digita e dar feedback imediato) quanto no backend
 * (ADR-004: "a validação deverá ocorrer... no backend, de forma
 * obrigatória" — o frontend nunca é o mecanismo de segurança/verdade).
 */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata progressivamente enquanto o usuário digita: até 11 dígitos vira
 * máscara de CPF (000.000.000-00); de 12 a 14 dígitos vira máscara de CNPJ
 * (00.000.000/0000-00).
 */
export function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5");
}

/** Algoritmo padrão de dígitos verificadores do CPF. */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const calc = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += digits[i]! * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calc(9) === digits[9] && calc(10) === digits[10];
}

/** Algoritmo padrão de dígitos verificadores do CNPJ. */
export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const digits = cnpj.split("").map(Number);
  const calc = (length: number): number => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i++) sum += digits[i]! * weights[i]!;
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return calc(12) === digits[12] && calc(13) === digits[13];
}

export type BrDocumentKind = "CPF" | "CNPJ";

export interface TaxIdValidation {
  digits: string;
  kind: BrDocumentKind | null;
  /** Tem 11 (CPF) ou 14 (CNPJ) dígitos — só faz sentido checar o dígito verificador quando completo. */
  complete: boolean;
  valid: boolean;
}

/** Ponto único de verdade para "isso é um CPF ou CNPJ válido?". */
export function validateTaxId(value: string): TaxIdValidation {
  const digits = onlyDigits(value);
  if (digits.length === 0) {
    return { digits, kind: null, complete: false, valid: true }; // campo vazio: válido (é opcional)
  }
  if (digits.length === 11) {
    return { digits, kind: "CPF", complete: true, valid: isValidCpf(digits) };
  }
  if (digits.length === 14) {
    return { digits, kind: "CNPJ", complete: true, valid: isValidCnpj(digits) };
  }
  return { digits, kind: null, complete: false, valid: false };
}
