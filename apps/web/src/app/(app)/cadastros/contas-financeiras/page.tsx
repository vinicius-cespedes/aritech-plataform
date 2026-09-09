"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface FinancialAccount {
  id: string;
  name: string;
  type: string;
  institutionName: string | null;
  currency: string;
  openingBalance: string;
  status: string;
}

const ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "CASH", "INVESTMENT", "PAYMENT", "DIGITAL_WALLET", "INTERNATIONAL", "OTHER"];

export default function FinancialAccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["financial-accounts"],
    queryFn: () => api.get<FinancialAccount[]>("/financial-accounts"),
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [institutionName, setInstitutionName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<FinancialAccount>("/financial-accounts", {
        name,
        type,
        institutionName: institutionName || undefined,
        openingBalance,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-accounts"] });
      setShowForm(false);
      setName("");
      setInstitutionName("");
      setOpeningBalance("0");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar conta."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Contas financeiras"
        description="Contas bancárias, caixa e aplicações usadas em pagamentos, recebimentos e conciliação — docx §10."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Nova conta"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome *">
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Bradesco — Conta Corrente" />
            </Field>
            <Field label="Tipo">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Instituição">
              <Input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
            </Field>
            <Field label="Saldo de abertura (R$)">
              <Input value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <ErrorBanner message={error} />
            </div>
            <div className="sm:col-span-2">
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
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Instituição</th>
              <th className="px-4 py-3">Saldo de abertura</th>
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
            {accounts?.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{account.name}</td>
                <td className="px-4 py-3 text-slate-600">{account.type}</td>
                <td className="px-4 py-3 text-slate-600">{account.institutionName ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(account.openingBalance)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={account.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
