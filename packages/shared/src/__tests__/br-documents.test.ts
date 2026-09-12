import { describe, expect, it } from "vitest";
import { formatCpfCnpj, isValidCnpj, isValidCpf, validateTaxId } from "../br-documents";

describe("formatCpfCnpj", () => {
  it("formata progressivamente como CPF até 11 dígitos", () => {
    expect(formatCpfCnpj("123")).toBe("123");
    expect(formatCpfCnpj("123456")).toBe("123.456");
    expect(formatCpfCnpj("123456789")).toBe("123.456.789");
    expect(formatCpfCnpj("12345678909")).toBe("123.456.789-09");
  });

  it("formata como CNPJ a partir de 12 dígitos", () => {
    expect(formatCpfCnpj("112223330001")).toBe("11.222.333/0001");
    expect(formatCpfCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("ignora caracteres não numéricos já digitados com máscara", () => {
    expect(formatCpfCnpj("123.456.789-09")).toBe("123.456.789-09");
  });

  it("trunca em 14 dígitos", () => {
    expect(formatCpfCnpj("112223330001819999")).toBe("11.222.333/0001-81");
  });
});

describe("isValidCpf", () => {
  it("aceita CPFs válidos (dígito verificador correto)", () => {
    expect(isValidCpf("12345678909")).toBe(true);
    expect(isValidCpf("98765432100")).toBe(true);
    expect(isValidCpf("123.456.789-09")).toBe(true); // aceita com máscara
  });

  it("rejeita CPF com dígito verificador incorreto", () => {
    expect(isValidCpf("12345678900")).toBe(false);
  });

  it("rejeita sequências de dígitos repetidos", () => {
    expect(isValidCpf("11111111111")).toBe(false);
  });

  it("rejeita tamanho incorreto", () => {
    expect(isValidCpf("123456789")).toBe(false);
  });
});

describe("isValidCnpj", () => {
  it("aceita CNPJs válidos (dígito verificador correto)", () => {
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("45678900010193")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true); // aceita com máscara
  });

  it("rejeita CNPJ com dígito verificador incorreto", () => {
    expect(isValidCnpj("11222333000199")).toBe(false);
  });

  it("rejeita sequências de dígitos repetidos", () => {
    expect(isValidCnpj("11111111111111")).toBe(false);
  });
});

describe("validateTaxId", () => {
  it("campo vazio é considerado válido (o campo é opcional)", () => {
    const result = validateTaxId("");
    expect(result.valid).toBe(true);
    expect(result.complete).toBe(false);
    expect(result.kind).toBeNull();
  });

  it("identifica CPF (11 dígitos) e valida o dígito verificador", () => {
    const result = validateTaxId("123.456.789-09");
    expect(result.kind).toBe("CPF");
    expect(result.complete).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("identifica CNPJ (14 dígitos) e valida o dígito verificador", () => {
    const result = validateTaxId("11.222.333/0001-81");
    expect(result.kind).toBe("CNPJ");
    expect(result.complete).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("quantidade de dígitos incompatível com CPF ou CNPJ é inválida", () => {
    const result = validateTaxId("123456");
    expect(result.complete).toBe(false);
    expect(result.valid).toBe(false);
  });
});
