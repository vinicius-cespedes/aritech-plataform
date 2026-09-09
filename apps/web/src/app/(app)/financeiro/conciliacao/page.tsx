"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface FinancialAccount {
  id: string;
  name: string;
}
interface BankTransaction {
  id: string;
  transactionDate: string;
  amount: string;
  direction: "CREDIT" | "DEBIT";
  description: string | null;
  counterpartyName: string | null;
  reconciliationStatus: string;
}
interface BankTransactionDetail extends BankTransaction {
  matches: Array<{ id: string; targetType: string; paymentId: string | null; receiptId: string | null; matchedAmount: string; status: string }>;
}
interface Suggestion {
  targetType: "PAYMENT" | "RECEIPT";
  targetId: string;
  unmatchedAmount: string;
  confidenceScore: number;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  criteria: string[];
}

const RECONCILIATION_FILTERS = [
  { value: "", label: "Todas" },
  { value: "UNRECONCILED", label: "Não conciliadas" },
  { value: "SUGGESTED", label: "Com sugestão" },
  { value: "PARTIALLY_RECONCILED", label: "Parcialmente conciliadas" },
  { value: "RECONCILED", label: "Conciliadas" },
];

export default function ReconciliationPage() {
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery({ queryKey: ["financial-accounts"], queryFn: () => api.get<FinancialAccount[]>("/financial-accounts") });
  const [accountId, setAccountId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ["bank-transactions", accountId, statusFilter],
    queryFn: () =>
      api.get<BankTransaction[]>(
        `/bank-transactions?${accountId ? `financialAccountId=${accountId}&` : ""}${statusFilter ? `reconciliationStatus=${statusFilter}` : ""}`,
      ),
    enabled: !!accountId,
  });

  const { data: selectedTx } = useQuery({
    queryKey: ["bank-transaction", selectedTxId],
    queryFn: () => api.get<BankTransactionDetail>(`/bank-transactions/${selectedTxId}`),
    enabled: !!selectedTxId,
  });

  const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ["bank-transaction-suggestions", selectedTxId],
    queryFn: () => api.get<Suggestion[]>(`/bank-transactions/${selectedTxId}/suggestions`),
    enabled: !!selectedTxId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("financialAccountId", accountId);
      formData.append("file", file);
      return api.postForm(`/bank-statement-imports`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      setUploadError(null);
    },
    onError: (err) => setUploadError(err instanceof ApiError ? err.message : "Erro ao importar OFX."),
  });

  const matchMutation = useMutation({
    mutationFn: (suggestion: Suggestion) =>
      api.post(`/bank-transactions/${selectedTxId}/matches`, {
        matches: [
          {
            targetType: suggestion.targetType,
            paymentId: suggestion.targetType === "PAYMENT" ? suggestion.targetId : undefined,
            receiptId: suggestion.targetType === "RECEIPT" ? suggestion.targetId : undefined,
            matchedAmount: suggestion.unmatchedAmount,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bank-transaction", selectedTxId] });
      queryClient.invalidateQueries({ queryKey: ["bank-transaction-suggestions", selectedTxId] });
      setMatchError(null);
    },
    onError: (err) => setMatchError(err instanceof ApiError ? err.message : "Erro ao confirmar conciliação."),
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!accountId) {
      setUploadError("Selecione a conta financeira antes de importar o arquivo.");
      return;
    }
    uploadMutation.mutate(file);
    event.target.value = "";
  }

  return (
    <div>
      <PageHeader
        title="Conciliação bancária"
        description="ADR-009 — o OFX é o fato bancário. Toda movimentação importada é vinculada a um Pagamento ou Recebimento por meio de conciliação."
      />

      <Card className="mb-6 p-5">
        <form onSubmit={(e: FormEvent) => e.preventDefault()} className="flex flex-wrap items-end gap-4">
          <div className="w-64">
            <Field label="Conta financeira">
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Selecione…</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="w-56">
            <Field label="Situação">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {RECONCILIATION_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div>
            <Label>Importar extrato (OFX)</Label>
            <input
              type="file"
              accept=".ofx"
              onChange={handleFileChange}
              className="block text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
            />
          </div>
        </form>
        <div className="mt-2">
          <ErrorBanner message={uploadError} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Extrato bancário</div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {!accountId && (
                <tr>
                  <td className="px-4 py-4 text-slate-500">Selecione uma conta financeira.</td>
                </tr>
              )}
              {accountId && loadingTx && (
                <tr>
                  <td className="px-4 py-4 text-slate-500">Carregando…</td>
                </tr>
              )}
              {transactions?.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTxId(tx.id)}
                  className={clsx("cursor-pointer", selectedTxId === tx.id ? "bg-brand-50" : "hover:bg-slate-50")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{tx.description ?? tx.counterpartyName ?? "—"}</p>
                        <p className="text-xs text-slate-500">{formatDate(tx.transactionDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className={tx.direction === "DEBIT" ? "font-medium text-red-600" : "font-medium text-emerald-600"}>
                          {tx.direction === "DEBIT" ? "-" : "+"} {formatMoney(tx.amount)}
                        </p>
                        <StatusBadge status={tx.reconciliationStatus} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            Sugestões de conciliação
          </div>
          <div className="p-4">
            {!selectedTxId && <p className="text-sm text-slate-500">Selecione uma movimentação à esquerda.</p>}
            {selectedTxId && selectedTx && (
              <div className="mb-4 rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-900">{selectedTx.description ?? "—"}</p>
                <p className="text-slate-600">
                  {formatDate(selectedTx.transactionDate)} · {selectedTx.direction === "DEBIT" ? "Débito" : "Crédito"} ·{" "}
                  {formatMoney(selectedTx.amount)}
                </p>
                {selectedTx.matches.filter((m) => m.status === "ACTIVE").length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold uppercase text-slate-500">Já conciliado com:</p>
                    {selectedTx.matches
                      .filter((m) => m.status === "ACTIVE")
                      .map((m) => (
                        <p key={m.id} className="text-xs text-slate-600">
                          {m.targetType} {m.paymentId ?? m.receiptId} — {formatMoney(m.matchedAmount)}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
            <ErrorBanner message={matchError} />
            {selectedTxId && loadingSuggestions && <p className="text-sm text-slate-500">Buscando sugestões…</p>}
            {selectedTxId && suggestions?.length === 0 && (
              <p className="text-sm text-slate-500">Nenhuma sugestão automática encontrada para esta movimentação.</p>
            )}
            <ul className="space-y-3">
              {suggestions?.map((s) => (
                <li key={`${s.targetType}-${s.targetId}`} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {s.targetType === "PAYMENT" ? "Pagamento" : "Recebimento"} {s.targetId.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-slate-500">Saldo não conciliado: {formatMoney(s.unmatchedAmount)}</p>
                      <p className="text-xs text-slate-500">Critérios: {s.criteria.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge
                        status={s.confidenceLevel === "HIGH" ? "SETTLED" : s.confidenceLevel === "MEDIUM" ? "PARTIALLY_SETTLED" : "DRAFT"}
                      />
                      <p className="mt-1 text-xs text-slate-500">Confiança: {s.confidenceScore}</p>
                    </div>
                  </div>
                  <Button className="mt-2" onClick={() => matchMutation.mutate(s)} disabled={matchMutation.isPending}>
                    Confirmar conciliação
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Label({ children }: { children: string }) {
  return <p className="mb-1 block text-sm font-medium text-slate-700">{children}</p>;
}
