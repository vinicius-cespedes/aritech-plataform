"use client";

import { formatCpfCnpj, validateTaxId } from "@aritech/shared";
import { useState } from "react";
import { Field, Input } from "./primitives";

/**
 * Campo de CPF/CNPJ com máscara progressiva (formata enquanto digita) e
 * validação de dígito verificador. O erro só aparece após o campo perder o
 * foco (ou quando já está "completo" — 11/14 dígitos) para não incomodar o
 * usuário no meio da digitação. A validação de verdade é sempre a do
 * backend (`packages/validation` → `taxIdSchema`); este componente é
 * conveniência de UX, conforme ADR-004 §14.
 */
export function TaxIdField({
  label = "CNPJ/CPF",
  value,
  onChange,
  required,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const result = validateTaxId(value);
  const showError = touched && value.length > 0 && (!result.complete || !result.valid);

  const errorMessage = !result.complete
    ? "CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos."
    : "CPF/CNPJ inválido — confira os dígitos verificadores.";

  return (
    <Field label={label}>
      <Input
        required={required}
        value={value}
        inputMode="numeric"
        placeholder="000.000.000-00 ou 00.000.000/0000-00"
        onChange={(e) => onChange(formatCpfCnpj(e.target.value))}
        onBlur={() => setTouched(true)}
        aria-invalid={showError}
        className={showError ? "border-red-400 focus:border-red-500 focus:ring-red-500" : undefined}
      />
      {showError && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
      {!showError && result.complete && result.valid && (
        <p className="mt-1 text-xs text-emerald-600">{result.kind} válido.</p>
      )}
    </Field>
  );
}
