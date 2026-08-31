export function normalizeTaxDocument(value?: string) {
  return (value ?? '').replace(/\D/g, '');
}

export function isValidCpf(value: string) {
  const cpf = normalizeTaxDocument(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (size: number) => {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function isValidCnpj(value: string) {
  const cnpj = normalizeTaxDocument(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (base: string) => {
    let factor = base.length - 7;
    let total = 0;
    for (const char of base) {
      total += Number(char) * factor--;
      if (factor < 2) factor = 9;
    }
    const result = total % 11;
    return result < 2 ? 0 : 11 - result;
  };
  const d1 = calc(cnpj.slice(0, 12));
  const d2 = calc(cnpj.slice(0, 12) + d1);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

export function isValidBrazilianTaxDocument(value: string) {
  const digits = normalizeTaxDocument(value);
  return digits.length === 11 ? isValidCpf(digits) : digits.length === 14 ? isValidCnpj(digits) : false;
}
