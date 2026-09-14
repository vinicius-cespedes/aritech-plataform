"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface CashFlowSummary {
  realized: { inflow: string; outflow: string; net: string };
  committed: { inflow: string; outflow: string; net: string };
  asOf: string;
}
interface PendingReconciliationSummary {
  pending: number;
  unreconciledAmount: string;
}
interface UpcomingRow {
  dueDate: string;
  direction: "INFLOW" | "OUTFLOW";
  amount: string;
  description: string;
  counterparty: string | null;
}
interface PeriodSummaryRow {
  year: number;
  month: number;
  periodId: string | null;
  status: string;
  closedAt: string | null;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function SummaryCard({ title, inflow, outflow, net }: { title: string; inflow: string; outflow: string; net: string }) {
  const isNegative = Number.parseFloat(net) < 0;
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${isNegative ? "text-red-600" : "text-emerald-600"}`}>
        {formatMoney(net)}
      </p>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>Entradas: {formatMoney(inflow)}</span>
        <span>Saídas: {formatMoney(outflow)}</span>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => api.get<CashFlowSummary>("/cashflow/summary"),
  });
  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ["bank-pending-summary"],
    queryFn: () => api.get<PendingReconciliationSummary>("/bank-transactions/pending-summary"),
  });
  const { data: upcoming, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["cashflow-upcoming"],
    queryFn: () => api.get<UpcomingRow[]>("/cashflow/upcoming?limit=8"),
  });
  const { data: periods, isLoading: loadingPeriods } = useQuery({
    queryKey: ["financial-periods-recent-summary"],
    queryFn: () => api.get<PeriodSummaryRow[]>("/financial-periods/recent-summary?months=3"),
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do fluxo de caixa, pendências de conciliação, próximas operações e fechamento dos últimos meses."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loadingSummary || !summary ? (
          <Card className="p-5 sm:col-span-2">
            <p className="text-sm text-slate-500">Carregando…</p>
          </Card>
        ) : (
          <>
            <SummaryCard title="Realizado" {...summary.realized} />
            <SummaryCard title="Comprometido" {...summary.committed} />
          </>
        )}

        <Link href="/financeiro/conciliacao">
          <Card className="h-full p-5 transition hover:border-brand-300 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">Pendências de conciliação</p>
            {loadingPending || !pending ? (
              <p className="mt-2 text-sm text-slate-500">Carregando…</p>
            ) : (
              <>
                <p className={`mt-2 text-2xl font-semibold ${pending.pending > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {pending.pending}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  {pending.pending > 0
                    ? `${formatMoney(pending.unreconciledAmount)} ainda sem registro/conciliação`
                    : "Tudo registrado e conciliado"}
                </p>
              </>
            )}
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            Próximas operações a acontecer
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {loadingUpcoming && (
                <tr>
                  <td className="px-4 py-4 text-slate-500">Carregando…</td>
                </tr>
              )}
              {upcoming?.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500">Nenhuma operação em aberto com vencimento futuro.</td>
                </tr>
              )}
              {upcoming?.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{row.description}</p>
                        <p className="text-xs text-slate-500">
                          {row.counterparty ?? "—"} · vence em {formatDate(row.dueDate)}
                        </p>
                      </div>
                      <p className={row.direction === "OUTFLOW" ? "font-medium text-red-600" : "font-medium text-emerald-600"}>
                        {row.direction === "OUTFLOW" ? "-" : "+"} {formatMoney(row.amount)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-200 px-4 py-3 text-right text-xs">
            <Link href="/financeiro/fluxo-de-caixa" className="text-brand-700 hover:underline">
              Ver fluxo de caixa completo →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            Fechamento dos últimos 3 meses
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {loadingPeriods && (
                <tr>
                  <td className="px-4 py-4 text-slate-500">Carregando…</td>
                </tr>
              )}
              {periods?.map((p) => (
                <tr key={`${p.year}-${p.month}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {MONTH_NAMES[p.month - 1]}/{p.year}
                        </p>
                        {p.closedAt && <p className="text-xs text-slate-500">Fechado em {formatDate(p.closedAt)}</p>}
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-200 px-4 py-3 text-right text-xs">
            <Link href="/financeiro/fechamento" className="text-brand-700 hover:underline">
              Ir para fechamento de período →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
