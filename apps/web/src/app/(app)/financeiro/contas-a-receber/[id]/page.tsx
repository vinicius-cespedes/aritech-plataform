"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney, parseMoneyInput } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface Installment {
  id: string;
  sequence: number;
  dueDate: string;
  originalAmount: string;
  openAmount: string;
  status: string;
}
interface ReceivableDetail {
  id: string;
  description: string;
  status: string;
  originalAmount: string;
  competenceDate: string;
  customer: { name: string };
  installments: Installment[];
}
interface FinancialAccount {
  id: string;
  name: string;
}

const RECEIPT_METHODS = ["PIX", "BANK_TRANSFER", "BOLETO", "CREDIT_CARD", "DEBIT_CARD", "CASH", "DIRECT_DEBIT", "CHECK", "OTHER"];

export default function ReceivableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: receivable, isLoading } = useQuery({
    queryKey: ["receivable", id],
    queryFn: () => api.get<ReceivableDetail>(`/receivables/${id}`),
  });
  const { data: financialAccounts } = useQuery({
    queryKey: ["financial-accounts"],
    queryFn: () => api.get<FinancialAccount[]>("/financial-accounts"),
  });

  const [error, setError] = useState<string | null>(null);
  const [receiveInstallmentId, setReceiveInstallmentId] = useState("");
  const [financialAccountId, setFinancialAccountId] = useState("");
  const [receiptMethod, setReceiptMethod] = useState("PIX");
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [principalAmount, setPrincipalAmount] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["receivable", id] });
    queryClient.invalidateQueries({ queryKey: ["receivables"] });
  };

  const receiveMutation = useMutation({
    mutationFn: () =>
      api.post("/receipts", {
        receiptDate,
        financialAccountId,
        receiptMethod,
        allocations: [{ receivableInstallmentId: receiveInstallmentId, principalAmount: parseMoneyInput(principalAmount) }],
      }),
    onSuccess: () => {
      invalidate();
      setPrincipalAmount("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao registrar recebimento."),
  });

  if (isLoading || !receivable) {
    return <p className="text-sm text-slate-500">Carregando…</p>;
  }

  const openInstallments = receivable.installments.filter((i) => i.status === "OPEN" || i.status === "PARTIALLY_SETTLED");

  return (
    <div>
      <button className="mb-4 text-sm text-brand-700 hover:underline" onClick={() => router.back()}>
        ← Voltar
      </button>
      <PageHeader
        title={receivable.description}
        description={`${receivable.customer.name} · Competência ${formatDate(receivable.competenceDate)} · ${formatMoney(receivable.originalAmount)}`}
        action={<StatusBadge status={receivable.status} />}
      />

      <ErrorBanner message={error} />

      <Card className="mb-6">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Valor original</th>
              <th className="px-4 py-3">Saldo em aberto</th>
              <th className="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receivable.installments.map((installment) => (
              <tr key={installment.id}>
                <td className="px-4 py-3">{installment.sequence}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(installment.dueDate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(installment.originalAmount)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(installment.openAmount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={installment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {openInstallments.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Registrar recebimento</h2>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              receiveMutation.mutate();
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label="Parcela *">
              <Select required value={receiveInstallmentId} onChange={(e) => setReceiveInstallmentId(e.target.value)}>
                <option value="">Selecione…</option>
                {openInstallments.map((i) => (
                  <option key={i.id} value={i.id}>
                    Parcela {i.sequence} — saldo {formatMoney(i.openAmount)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Valor recebido (principal, R$) *">
              <Input required value={principalAmount} onChange={(e) => setPrincipalAmount(e.target.value)} placeholder="100,00" />
            </Field>
            <Field label="Conta financeira *">
              <Select required value={financialAccountId} onChange={(e) => setFinancialAccountId(e.target.value)}>
                <option value="">Selecione…</option>
                {financialAccounts?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Forma de recebimento">
              <Select value={receiptMethod} onChange={(e) => setReceiptMethod(e.target.value)}>
                {RECEIPT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data do recebimento">
              <Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={receiveMutation.isPending}>
                {receiveMutation.isPending ? "Registrando..." : "Registrar recebimento"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
