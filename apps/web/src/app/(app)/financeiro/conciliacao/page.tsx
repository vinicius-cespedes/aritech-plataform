"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney, parseMoneyInput } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { SupplierPicker } from "@/components/pickers/supplier-picker";
import { CustomerPicker } from "@/components/pickers/customer-picker";

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
interface NamedOption {
  id: string;
  name: string;
}
interface ManagementAccountOption {
  id: string;
  code: string;
  name: string;
  allowsPosting: boolean;
}

const OTHER_CLASSIFICATION_OPTIONS = [
  { value: "TRANSFER", label: "Transferência entre contas" },
  { value: "BANK_FEE", label: "Tarifa bancária" },
  { value: "FINANCIAL_INCOME", label: "Rendimento financeiro" },
  { value: "ADVANCE", label: "Adiantamento" },
  { value: "OTHER", label: "Diverso / a identificar" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "BANK_TRANSFER", label: "Transferência bancária" },
  { value: "PIX", label: "PIX" },
  { value: "BOLETO", label: "Boleto" },
  { value: "DIRECT_DEBIT", label: "Débito automático" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "DEBIT_CARD", label: "Cartão de débito" },
  { value: "CHECK", label: "Cheque" },
  { value: "CASH", label: "Dinheiro" },
  { value: "OTHER", label: "Outro" },
];

const EMPTY_CLASSIFY_FORM = {
  supplierId: "",
  customerId: "",
  costCenterId: "",
  resultCenterId: "",
  managementAccountId: "",
  description: "",
  documentNumber: "",
  paymentMethod: "BANK_TRANSFER",
  receiptMethod: "BANK_TRANSFER",
  otherTargetType: "BANK_FEE",
  note: "",
  amount: "",
};

function unreconciledAmount(tx: BankTransactionDetail): number {
  const matched = tx.matches.filter((m) => m.status === "ACTIVE").reduce((sum, m) => sum + Number(m.matchedAmount), 0);
  return Math.max(0, Number(tx.amount) - matched);
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
  const [classifyKind, setClassifyKind] = useState<"SUPPLIER_PAYMENT" | "CUSTOMER_RECEIPT" | "OTHER">("SUPPLIER_PAYMENT");
  const [classifyForm, setClassifyForm] = useState(EMPTY_CLASSIFY_FORM);
  const [classifyError, setClassifyError] = useState<string | null>(null);

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

  const { data: costCenters } = useQuery({ queryKey: ["cost-centers"], queryFn: () => api.get<NamedOption[]>("/cost-centers") });
  const { data: resultCenters } = useQuery({ queryKey: ["result-centers"], queryFn: () => api.get<NamedOption[]>("/result-centers") });
  const { data: managementAccounts } = useQuery({
    queryKey: ["management-accounts"],
    queryFn: () => api.get<ManagementAccountOption[]>("/management-accounts"),
  });
  const postableManagementAccounts = useMemo(
    () => managementAccounts?.filter((a) => a.allowsPosting) ?? [],
    [managementAccounts],
  );

  // Ao trocar de movimentação selecionada, reseta o formulário de classificação
  // com um tipo padrão coerente com a direção (débito → fornecedor, crédito → cliente)
  // e o valor não conciliado pré-preenchido. Depende só do id (não do objeto
  // inteiro) de propósito: um refetch em segundo plano (ex.: após confirmar
  // outra classificação parcial) não deve apagar o que o usuário já digitou.
  useEffect(() => {
    if (!selectedTx) return;
    setClassifyKind(selectedTx.direction === "DEBIT" ? "SUPPLIER_PAYMENT" : "CUSTOMER_RECEIPT");
    setClassifyForm({ ...EMPTY_CLASSIFY_FORM, amount: unreconciledAmount(selectedTx).toFixed(2).replace(".", ",") });
    setClassifyError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTx?.id]);

  const classifyMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post(`/bank-transactions/${selectedTxId}/classify`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bank-transaction", selectedTxId] });
      queryClient.invalidateQueries({ queryKey: ["bank-transaction-suggestions", selectedTxId] });
      // A classificação vira caixa realizado imediatamente (Payment/Receipt
      // já liquidado, ou classificação leve de tarifa/rendimento/etc.) — o
      // fluxo de caixa precisa refletir isso sem exigir um refresh manual.
      queryClient.invalidateQueries({ queryKey: ["cashflow-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow-aging"] });
      setClassifyError(null);
    },
    onError: (err) => setClassifyError(err instanceof ApiError ? err.message : "Erro ao classificar movimentação."),
  });

  function handleClassifySubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedTxId) return;
    const amount = classifyForm.amount ? parseMoneyInput(classifyForm.amount) : undefined;

    if (classifyKind === "SUPPLIER_PAYMENT") {
      classifyMutation.mutate({
        kind: "SUPPLIER_PAYMENT",
        supplierId: classifyForm.supplierId || undefined,
        costCenterId: classifyForm.costCenterId,
        managementAccountId: classifyForm.managementAccountId,
        description: classifyForm.description,
        documentNumber: classifyForm.documentNumber || undefined,
        paymentMethod: classifyForm.paymentMethod,
        amount,
      });
    } else if (classifyKind === "CUSTOMER_RECEIPT") {
      classifyMutation.mutate({
        kind: "CUSTOMER_RECEIPT",
        customerId: classifyForm.customerId,
        resultCenterId: classifyForm.resultCenterId || undefined,
        managementAccountId: classifyForm.managementAccountId,
        description: classifyForm.description,
        documentNumber: classifyForm.documentNumber || undefined,
        receiptMethod: classifyForm.receiptMethod,
        amount,
      });
    } else {
      classifyMutation.mutate({
        kind: "OTHER",
        targetType: classifyForm.otherTargetType,
        note: classifyForm.note || undefined,
        amount,
      });
    }
  }

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
      queryClient.invalidateQueries({ queryKey: ["cashflow-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow-aging"] });
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

      {selectedTxId && selectedTx && (
        <Card className="mb-6">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            Classificar como operação da empresa
          </div>
          <div className="p-4">
            <p className="mb-4 text-sm text-slate-500">
              Para movimentações sem um pagamento/recebimento já lançado no sistema (o caso mais comum logo após
              importar o extrato): registre aqui a operação correspondente — fornecedor, cliente, centro de custo ou
              centro de resultado — e ela já é conciliada automaticamente com esta movimentação bancária.
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {selectedTx.direction === "DEBIT" && (
                <Button
                  type="button"
                  variant={classifyKind === "SUPPLIER_PAYMENT" ? "primary" : "secondary"}
                  onClick={() => setClassifyKind("SUPPLIER_PAYMENT")}
                >
                  Pagamento a fornecedor
                </Button>
              )}
              {selectedTx.direction === "CREDIT" && (
                <Button
                  type="button"
                  variant={classifyKind === "CUSTOMER_RECEIPT" ? "primary" : "secondary"}
                  onClick={() => setClassifyKind("CUSTOMER_RECEIPT")}
                >
                  Recebimento de cliente
                </Button>
              )}
              <Button type="button" variant={classifyKind === "OTHER" ? "primary" : "secondary"} onClick={() => setClassifyKind("OTHER")}>
                Outra classificação
              </Button>
            </div>

            <ErrorBanner message={classifyError} />

            <form onSubmit={handleClassifySubmit} className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {classifyKind === "SUPPLIER_PAYMENT" && (
                <>
                  <SupplierPicker
                    label="Fornecedor (opcional para tarifas/impostos sem fornecedor)"
                    value={classifyForm.supplierId}
                    onChange={(supplierId) => setClassifyForm({ ...classifyForm, supplierId })}
                  />
                  <Field label="Centro de custo *">
                    <Select
                      required
                      value={classifyForm.costCenterId}
                      onChange={(e) => setClassifyForm({ ...classifyForm, costCenterId: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {costCenters?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Conta gerencial *">
                    <Select
                      required
                      value={classifyForm.managementAccountId}
                      onChange={(e) => setClassifyForm({ ...classifyForm, managementAccountId: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {postableManagementAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Forma de pagamento">
                    <Select
                      value={classifyForm.paymentMethod}
                      onChange={(e) => setClassifyForm({ ...classifyForm, paymentMethod: e.target.value })}
                    >
                      {PAYMENT_METHOD_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Descrição *">
                    <Input
                      required
                      value={classifyForm.description}
                      onChange={(e) => setClassifyForm({ ...classifyForm, description: e.target.value })}
                      placeholder="Ex.: Tarifa mensal conta corrente"
                    />
                  </Field>
                  <Field label="Nº do documento">
                    <Input
                      value={classifyForm.documentNumber}
                      onChange={(e) => setClassifyForm({ ...classifyForm, documentNumber: e.target.value })}
                    />
                  </Field>
                </>
              )}

              {classifyKind === "CUSTOMER_RECEIPT" && (
                <>
                  <CustomerPicker
                    label="Cliente *"
                    required
                    value={classifyForm.customerId}
                    onChange={(customerId) => setClassifyForm({ ...classifyForm, customerId })}
                  />
                  <Field label="Centro de resultado">
                    <Select
                      value={classifyForm.resultCenterId}
                      onChange={(e) => setClassifyForm({ ...classifyForm, resultCenterId: e.target.value })}
                    >
                      <option value="">Nenhum</option>
                      {resultCenters?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Conta gerencial *">
                    <Select
                      required
                      value={classifyForm.managementAccountId}
                      onChange={(e) => setClassifyForm({ ...classifyForm, managementAccountId: e.target.value })}
                    >
                      <option value="">Selecione…</option>
                      {postableManagementAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Forma de recebimento">
                    <Select
                      value={classifyForm.receiptMethod}
                      onChange={(e) => setClassifyForm({ ...classifyForm, receiptMethod: e.target.value })}
                    >
                      {PAYMENT_METHOD_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Descrição *">
                    <Input
                      required
                      value={classifyForm.description}
                      onChange={(e) => setClassifyForm({ ...classifyForm, description: e.target.value })}
                      placeholder="Ex.: Recebimento fatura NF 1234"
                    />
                  </Field>
                  <Field label="Nº do documento">
                    <Input
                      value={classifyForm.documentNumber}
                      onChange={(e) => setClassifyForm({ ...classifyForm, documentNumber: e.target.value })}
                    />
                  </Field>
                </>
              )}

              {classifyKind === "OTHER" && (
                <>
                  <Field label="Tipo">
                    <Select
                      value={classifyForm.otherTargetType}
                      onChange={(e) => setClassifyForm({ ...classifyForm, otherTargetType: e.target.value })}
                    >
                      {OTHER_CLASSIFICATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Observação">
                    <Input value={classifyForm.note} onChange={(e) => setClassifyForm({ ...classifyForm, note: e.target.value })} />
                  </Field>
                </>
              )}

              <Field label="Valor a classificar">
                <Input value={classifyForm.amount} onChange={(e) => setClassifyForm({ ...classifyForm, amount: e.target.value })} />
              </Field>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={classifyMutation.isPending}>
                  Classificar e conciliar
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

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
