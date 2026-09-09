"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";

interface ManagementAccount {
  id: string;
  code: string;
  name: string;
  nature: string;
  classification: string;
  allowsPosting: boolean;
}

const NATURES = ["DEBIT", "CREDIT", "NEUTRAL"];
const CLASSIFICATIONS = [
  "REVENUE",
  "TAX_DEDUCTION",
  "DIRECT_COST",
  "INDIRECT_COST",
  "OPERATING_EXPENSE",
  "FINANCIAL_INCOME",
  "FINANCIAL_EXPENSE",
  "INVESTMENT",
  "FINANCING",
  "EQUITY",
  "TRANSFER",
  "OTHER",
];

export default function ManagementAccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["management-accounts"],
    queryFn: () => api.get<ManagementAccount[]>("/management-accounts"),
  });

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nature, setNature] = useState("DEBIT");
  const [classification, setClassification] = useState("OPERATING_EXPENSE");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => api.post<ManagementAccount>("/management-accounts", { code, name, nature, classification }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-accounts"] });
      setShowForm(false);
      setCode("");
      setName("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar conta gerencial."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Plano de contas gerencial"
        description="Natureza econômica da receita/despesa — separada do fornecedor (docx §15). Usado na classificação de contas a pagar/receber."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Nova conta"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Código *">
              <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex.: 5.11" />
            </Field>
            <Field label="Nome *">
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Natureza">
              <Select value={nature} onChange={(e) => setNature(e.target.value)}>
                {NATURES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Classificação">
              <Select value={classification} onChange={(e) => setClassification(e.target.value)}>
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
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
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Natureza</th>
              <th className="px-4 py-3">Classificação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={4}>
                  Carregando…
                </td>
              </tr>
            )}
            {accounts?.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3 font-mono text-slate-700">{account.code}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{account.name}</td>
                <td className="px-4 py-3 text-slate-600">{account.nature}</td>
                <td className="px-4 py-3 text-slate-600">{account.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
