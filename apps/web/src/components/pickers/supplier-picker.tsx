"use client";

import { useState, type FormEvent } from "react";
import { SUPPLIER_BUSINESS_AREAS } from "@aritech/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, ErrorBanner, Field, Input, Modal, Select } from "@/components/ui/primitives";
import { TaxIdField } from "@/components/ui/tax-id-field";

interface SupplierOption {
  id: string;
  name: string;
}

const EMPTY_FORM = { name: "", taxId: "", businessArea: "", contactName: "", contactEmail: "", contactPhone: "" };

/**
 * Select de fornecedor com atalho "+ Novo" para cadastrar um fornecedor sem
 * sair do formulário atual (registro de conta a pagar, classificação de
 * conciliação, etc.) — só os campos principais; o cadastro completo
 * (endereço, múltiplos contatos) continua em Cadastros » Fornecedores.
 */
export function SupplierPicker({
  label = "Fornecedor",
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
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: () => api.get<SupplierOption[]>("/suppliers") });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<SupplierOption>("/suppliers", {
        name: form.name,
        taxId: form.taxId || undefined,
        businessArea: form.businessArea || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      onChange(created.id);
      setOpen(false);
      setForm(EMPTY_FORM);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar fornecedor."),
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
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
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
        <Modal title="Novo fornecedor" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorBanner message={error} />
            <Field label="Razão social *">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <TaxIdField value={form.taxId} onChange={(taxId) => setForm({ ...form, taxId })} />
            <Field label="Ramo de atividade">
              <Select value={form.businessArea} onChange={(e) => setForm({ ...form, businessArea: e.target.value })}>
                <option value="">Selecione…</option>
                {SUPPLIER_BUSINESS_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nome do contato">
              <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </Field>
            <Field label="E-mail do contato">
              <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </Field>
            <Field label="Telefone do contato">
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
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
