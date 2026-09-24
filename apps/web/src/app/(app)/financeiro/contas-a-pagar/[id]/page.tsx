"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney, parseMoneyInput } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { PayableClassificationCard, type PayableClassificationData } from "@/components/classification-cards";

interface Installment {
  id: string;
  sequence: number;
  dueDate: string;
  originalAmount: string;
  openAmount: string;
  status: string;
}
interface PayableDetail extends PayableClassificationData {
  originalAmount: string;
  competenceDate: string;
  installments: Array<Installment & { notes?: string | null }>;
}
interface FinancialAccount {
  id: string;
  name: string;
}

const PAYMENT_METHODS = ["PIX", "BANK_TRANSFER", "BOLETO", "CREDIT_CARD", "DEBIT_CARD", "CASH", "DIRECT_DEBIT", "CHECK", "OTHER"];

export default function PayableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: payable, isLoading } = useQuery({
    queryKey: ["payable", id],
    queryFn: () => api.get<PayableDetail>(`/payables/${id}`),
  });
  const { data: financialAccounts } = useQuery({
    queryKey: ["financial-accounts"],
    queryFn: () => api.get<FinancialAccount[]>("/financial-accounts"),
  });

  const [error, setError] = useState<string | null>(null);
  const [payInstallmentId, setPayInstallmentId] = useState("");
  const [financialAccountId, setFinancialAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [principalAmount, setPrincipalAmount] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["payable", id] });
    queryClient.invalidateQueries({ queryKey: ["payables"] });
  };

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/payables/${id}/approve`),
    onSuccess: invalidate,
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao aprovar."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => {
      const reason = window.prompt("Motivo da reprovação:");
      if (!reason) throw new Error("cancelled");
      return api.post(`/payables/${id}/reject`, { reason });
    },
    onSuccess: invalidate,
    onError: (err) => {
      if (err instanceof ApiError) setError(err.message);
    },
  });

  const payMutation = useMutation({
    mutationFn: () =>
      api.post("/payments", {
        paymentDate,
        financialAccountId,
        paymentMethod,
        allocations: [{ payableInstallmentId: payInstallmentId, principalAmount: parseMoneyInput(principalAmount) }],
      }),
    onSuccess: () => {
      invalidate();
      setPrincipalAmount("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao registrar pagamento."),
  });

  if (isLoading || !payable) {
    return <p className="text-sm text-slate-500">Carregando…</p>;
  }

  const openInstallments = payable.installments.filter((i) => i.status === "OPEN" || i.status === "PARTIALLY_SETTLED");

  return (
    <div>
      <button className="mb-4 text-sm text-brand-700 hover:underline" onClick={() => router.back()}>
        ← Voltar
      </button>
      <PageHeader
        title={payable.description}
        description={`${payable.supplier?.name ?? payable.employee?.name ?? ""} · Competência ${formatDate(payable.competenceDate)} · ${formatMoney(payable.originalAmount)}`}
        action={<StatusBadge status={payable.status} />}
      />

      <ErrorBanner message={error} />

      {payable.status === "PENDING_APPROVAL" && (
        <Card className="mb-6 p-5">
          <p className="mb-3 text-sm text-slate-600">Docx §9 — esta conta aguarda aprovação da diretoria.</p>
          <div className="flex gap-3">
            <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              Aprovar
            </Button>
            <Button variant="danger" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
              Reprovar
            </Button>
          </div>
        </Card>
      )}

      <PayableClassificationCard key={`${payable.id}-${payable.costCenterId}-${payable.contractId}-${payable.managementAccountId}-${payable.counterpartyType}`} payable={payable} />

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
            {payable.installments.map((installment) => (
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

      {(payable.status === "OPEN" || payable.status === "PARTIALLY_SETTLED") && openInstallments.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Registrar pagamento</h2>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              payMutation.mutate();
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label="Parcela *">
              <Select required value={payInstallmentId} onChange={(e) => setPayInstallmentId(e.target.value)}>
                <option value="">Selecione…</option>
                {openInstallments.map((i) => (
                  <option key={i.id} value={i.id}>
                    Parcela {i.sequence} — saldo {formatMoney(i.openAmount)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Valor a pagar (principal, R$) *">
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
            <Field label="Forma de pagamento">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data do pagamento">
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={payMutation.isPending}>
                {payMutation.isPending ? "Registrando..." : "Registrar pagamento"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
