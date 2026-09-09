"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney, parseMoneyInput } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface Payable {
  id: string;
  description: string;
  competenceDate: string;
  originalAmount: string;
  status: string;
  supplier?: { name: string } | null;
  employee?: { name: string } | null;
  installments: Array<{ dueDate: string }>;
}
interface Supplier {
  id: string;
  name: string;
}
interface ManagementAccount {
  id: string;
  code: string;
  name: string;
}
interface CostCenter {
  id: string;
  code: string;
  name: string;
}

export default function PayablesPage() {
  const queryClient = useQueryClient();
  const { data: payables, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: () => api.get<Payable[]>("/payables"),
  });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: () => api.get<Supplier[]>("/suppliers") });
  const { data: managementAccounts } = useQuery({
    queryKey: ["management-accounts"],
    queryFn: () => api.get<ManagementAccount[]>("/management-accounts"),
  });
  const { data: costCenters } = useQuery({ queryKey: ["cost-centers"], queryFn: () => api.get<CostCenter[]>("/cost-centers") });

  const [showForm, setShowForm] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [competenceDate, setCompetenceDate] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [managementAccountId, setManagementAccountId] = useState("");
  const [costCenterId, setCostCenterId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Payable>("/payables", {
        counterpartyType: "SUPPLIER",
        supplierId,
        description,
        competenceDate,
        firstDueDate,
        originalAmount: parseMoneyInput(amount),
        installmentsCount,
        managementAccountId,
        costCenterId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      setShowForm(false);
      setDescription("");
      setAmount("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao criar conta a pagar."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Contas a pagar"
        description="Docx §8 — novos lançamentos entram inicialmente em aprovação."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Nova conta a pagar"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Fornecedor *">
              <Select required value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Selecione…</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="lg:col-span-2">
              <Field label="Descrição *">
                <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
            <Field label="Conta gerencial *">
              <Select required value={managementAccountId} onChange={(e) => setManagementAccountId(e.target.value)}>
                <option value="">Selecione…</option>
                {managementAccounts?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Centro de custo *">
              <Select required value={costCenterId} onChange={(e) => setCostCenterId(e.target.value)}>
                <option value="">Selecione…</option>
                {costCenters?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Valor total (R$) *">
              <Input required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1.000,00" />
            </Field>
            <Field label="Competência *">
              <Input type="date" required value={competenceDate} onChange={(e) => setCompetenceDate(e.target.value)} />
            </Field>
            <Field label="1º vencimento *">
              <Input type="date" required value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
            </Field>
            <Field label="Número de parcelas">
              <Input
                type="number"
                min={1}
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value) || 1)}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorBanner message={error} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Beneficiário</th>
              <th className="px-4 py-3">Competência</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Carregando…
                </td>
              </tr>
            )}
            {payables?.map((payable) => (
              <tr key={payable.id} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/financeiro/contas-a-pagar/${payable.id}`} className="font-medium text-brand-700 hover:underline">
                    {payable.description}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{payable.supplier?.name ?? payable.employee?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(payable.competenceDate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(payable.originalAmount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={payable.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
