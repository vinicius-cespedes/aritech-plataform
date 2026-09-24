"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatMoney, parseMoneyInput } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { CustomerPicker } from "@/components/pickers/customer-picker";
import {
  CONTRACT_STATUS_LABEL,
  businessLineName,
  useContracts,
  useResultCenters,
  type ContractRow,
} from "@/lib/allocation";

const EMPTY_FORM = { customerId: "", code: "", description: "", businessLineId: "", amount: "", startDate: "", endDate: "" };

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const { data: contracts, isLoading } = useContracts();
  const { data: resultCenters } = useResultCenters();
  const businessLines = (resultCenters ?? []).filter((r) => !r.parentId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    queryClient.invalidateQueries({ queryKey: ["result-centers"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<ContractRow>("/contracts", {
        customerId: form.customerId,
        code: form.code.trim(),
        description: form.description || undefined,
        businessLineId: form.businessLineId,
        amount: form.amount ? parseMoneyInput(form.amount) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }),
    onSuccess: () => {
      refresh();
      setForm(EMPTY_FORM);
      setShowForm(false);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao criar contrato."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/contracts/${id}`, body),
    onSuccess: () => {
      refresh();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao atualizar contrato."),
  });

  return (
    <div>
      <PageHeader
        title="Contratos"
        description="Cada contrato liga um cliente a uma linha de negócio. Ao criar, o sistema gera o centro de resultado do contrato, o subcentro de custo em Produção e o projeto."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo contrato"}</Button>}
      />

      <ErrorBanner message={error} />

      {showForm && (
        <Card className="mb-6 p-5">
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <CustomerPicker required value={form.customerId} onChange={(id) => setForm({ ...form, customerId: id })} />
            <Field label="Código / nome do contrato *">
              <Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Field>
            <Field label="Linha de negócio *">
              <Select required value={form.businessLineId} onChange={(e) => setForm({ ...form, businessLineId: e.target.value })}>
                <option value="">Selecione…</option>
                {businessLines.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="lg:col-span-3">
              <Field label="Descrição">
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
            <Field label="Valor do contrato (R$)">
              <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="100.000,00" />
            </Field>
            <Field label="Início">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Término">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Criar contrato"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Contrato</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Linha de negócio</th>
                <th className="px-4 py-3">Centro de resultado</th>
                <th className="px-4 py-3">Subcentro de custo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>
                    Carregando…
                  </td>
                </tr>
              )}
              {contracts?.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.code}</td>
                  <td className="px-4 py-3 text-slate-600">{c.customer.name}</td>
                  <td className="px-4 py-3">
                    <Select
                      aria-label={`Linha de negócio de ${c.code}`}
                      value={c.resultCenter?.parent?.id ?? ""}
                      onChange={(e) => updateMutation.mutate({ id: c.id, body: { businessLineId: e.target.value } })}
                    >
                      {!c.resultCenter?.parent && <option value="">{businessLineName(c)}</option>}
                      {businessLines.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.resultCenter?.code ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.costCenter?.code ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.amount ? formatMoney(c.amount) : "—"}</td>
                  <td className="px-4 py-3">
                    <Select
                      aria-label={`Situação de ${c.code}`}
                      value={c.status}
                      onChange={(e) => updateMutation.mutate({ id: c.id, body: { status: e.target.value } })}
                    >
                      {Object.entries(CONTRACT_STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
