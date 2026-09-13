"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, ErrorBanner, Field, Input, Modal, Select } from "@/components/ui/primitives";
import { TaxIdField } from "@/components/ui/tax-id-field";

interface CustomerOption {
  id: string;
  name: string;
}

const EMPTY_FORM = { name: "", taxId: "", email: "", phone: "" };

/**
 * Select de cliente com atalho "+ Novo" para cadastrar um cliente sem sair
 * do formulário atual (registro de conta a receber, classificação de
 * conciliação, etc.) — cadastro completo continua em Cadastros » Clientes.
 */
export function CustomerPicker({
  label = "Cliente",
  value,
  onChange,
  required,
}: {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: () => api.get<CustomerOption[]>("/customers") });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<CustomerOption>("/customers", {
        name: form.name,
        taxId: form.taxId || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onChange(created.id);
      setOpen(false);
      setForm(EMPTY_FORM);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar cliente."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <>
      <Field label={label}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select required={required} value={value} onChange={(e) => onChange(e.target.value)}>
              <option value="">Selecione…</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            + Novo
          </Button>
        </div>
      </Field>

      {open && (
        <Modal title="Novo cliente" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorBanner message={error} />
            <Field label="Razão social *">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <TaxIdField value={form.taxId} onChange={(taxId) => setForm({ ...form, taxId })} />
            <Field label="E-mail">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Telefone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Cadastrando…" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
