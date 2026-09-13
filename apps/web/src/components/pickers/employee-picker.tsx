"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, ErrorBanner, Field, Input, Modal, Select } from "@/components/ui/primitives";
import { TaxIdField } from "@/components/ui/tax-id-field";

interface EmployeeOption {
  id: string;
  name: string;
}
interface CostCenterOption {
  id: string;
  name: string;
}

const EMPLOYMENT_TYPES = ["CLT", "PJ", "Estagiário", "Temporário", "Sócio", "Outro"];

const EMPTY_FORM = { name: "", taxId: "", role: "", employmentType: "", costCenterId: "" };

/**
 * Select de colaborador com atalho "+ Novo" para cadastrar um colaborador
 * sem sair do formulário atual (registro de conta a pagar quando o
 * beneficiário é um colaborador, não um fornecedor) — cadastro completo
 * continua em Cadastros » Colaboradores.
 */
export function EmployeePicker({
  label = "Colaborador",
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
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => api.get<EmployeeOption[]>("/employees") });
  const { data: costCenters } = useQuery({ queryKey: ["cost-centers"], queryFn: () => api.get<CostCenterOption[]>("/cost-centers") });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<EmployeeOption>("/employees", {
        name: form.name,
        taxId: form.taxId || undefined,
        role: form.role || undefined,
        employmentType: form.employmentType || undefined,
        costCenterId: form.costCenterId || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onChange(created.id);
      setOpen(false);
      setForm(EMPTY_FORM);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar colaborador."),
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
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
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
        <Modal title="Novo colaborador" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorBanner message={error} />
            <Field label="Nome *">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <TaxIdField label="CPF" value={form.taxId} onChange={(taxId) => setForm({ ...form, taxId })} />
            <Field label="Vínculo">
              <Select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                <option value="">Selecione…</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cargo/função">
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
            <Field label="Centro de custo">
              <Select value={form.costCenterId} onChange={(e) => setForm({ ...form, costCenterId: e.target.value })}>
                <option value="">Selecione…</option>
                {costCenters?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
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
