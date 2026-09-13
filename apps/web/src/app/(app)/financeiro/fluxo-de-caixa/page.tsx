"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { Card, Field, Input, PageHeader } from "@/components/ui/primitives";
import { CashFlowChart, type CashFlowChartPoint } from "@/components/charts/cashflow-chart";

interface CashFlowSummary {
  realized: { inflow: string; outflow: string; net: string };
  committed: { inflow: string; outflow: string; net: string };
}
interface AgingRow {
  id: string;
  dueDate: string;
  openAmount: string;
  daysOverdue: number;
  payable?: { description: string; supplier?: { name: string } | null; employee?: { name: string } | null };
  receivable?: { description: string; customer: { name: string } };
}
interface AgingResponse {
  payables: AgingRow[];
  receivables: AgingRow[];
}
interface CashFlowTransactionRow {
  date: string;
  kind: "PAYMENT" | "RECEIPT" | "BANK_FEE" | "FINANCIAL_INCOME" | "ADVANCE" | "OTHER";
  direction: "INFLOW" | "OUTFLOW";
  amount: string;
  description: string;
}
interface CashFlowTimeseries {
  from: string;
  to: string;
  daily: CashFlowChartPoint[];
  transactions: CashFlowTransactionRow[];
}

const KIND_LABELS: Record<CashFlowTransactionRow["kind"], string> = {
  PAYMENT: "Pagamento",
  RECEIPT: "Recebimento",
  BANK_FEE: "Tarifa bancária",
  FINANCIAL_INCOME: "Rendimento financeiro",
  ADVANCE: "Adiantamento",
  OTHER: "Diverso",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const RANGE_PRESETS = [
  { label: "30 dias", days: 29 },
  { label: "90 dias", days: 89 },
  { label: "180 dias", days: 179 },
];

function AgingTable({ title, rows, nameOf }: { title: string; rows: AgingRow[]; nameOf: (row: AgingRow) => string }) {
  return (
    <Card>
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">{title}</div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Descrição</th>
            <th className="px-4 py-2">Vencimento</th>
            <th className="px-4 py-2">Saldo</th>
            <th className="px-4 py-2">Atraso</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-slate-500" colSpan={4}>
                Nenhum item em aberto.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-2 text-slate-900">{nameOf(row)}</td>
              <td className="px-4 py-2 text-slate-600">{formatDate(row.dueDate)}</td>
              <td className="px-4 py-2 text-slate-600">{formatMoney(row.openAmount)}</td>
              <td className="px-4 py-2 text-slate-600">{row.daysOverdue > 0 ? `${row.daysOverdue} dia(s)` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default function CashFlowPage() {
  const [from, setFrom] = useState(() => daysAgoIso(89));
  const [to, setTo] = useState(() => todayIso());

  const { data: summary } = useQuery({ queryKey: ["cashflow-summary"], queryFn: () => api.get<CashFlowSummary>("/cashflow/summary") });
  const { data: aging, isLoading: loadingAging } = useQuery({
    queryKey: ["cashflow-aging"],
    queryFn: () => api.get<AgingResponse>("/cashflow/aging"),
  });
  const { data: timeseries, isLoading: loadingTimeseries } = useQuery({
    queryKey: ["cashflow-timeseries", from, to],
    queryFn: () => api.get<CashFlowTimeseries>(`/cashflow/timeseries?from=${from}&to=${to}`),
  });

  const periodTotals = useMemo(() => {
    if (!timeseries) return null;
    const inflow = timeseries.daily.reduce((sum, d) => sum + Number(d.realizedInflow), 0);
    const outflow = timeseries.daily.reduce((sum, d) => sum + Number(d.realizedOutflow), 0);
    return { inflow, outflow, net: inflow - outflow };
  }, [timeseries]);

  return (
    <div>
      <PageHeader
        title="Fluxo de caixa"
        description="Docx §14 — realizado (conciliado com OFX) e comprometido (aprovado, em aberto). Nível 'Previsto' fica para iteração futura."
      />

      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Realizado (total, todas as datas)</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(summary.realized.net)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Comprometido (em aberto)</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(summary.committed.net)}</p>
          </Card>
        </div>
      )}

      <Card className="mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-40">
              <Field label="De">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
            </div>
            <div className="w-40">
              <Field label="Até">
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-2 pb-0.5">
              {RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setFrom(daysAgoIso(preset.days));
                    setTo(todayIso());
                  }}
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          {periodTotals && (
            <div className="flex gap-6 text-right text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Entradas no período</p>
                <p className="font-semibold text-emerald-600">{formatMoney(periodTotals.inflow)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Saídas no período</p>
                <p className="font-semibold text-red-600">{formatMoney(periodTotals.outflow)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Saldo do período</p>
                <p className="font-semibold text-slate-900">{formatMoney(periodTotals.net)}</p>
              </div>
            </div>
          )}
        </div>

        {loadingTimeseries && <p className="text-sm text-slate-500">Carregando…</p>}
        {timeseries && timeseries.daily.every((d) => Number(d.realizedInflow) === 0 && Number(d.realizedOutflow) === 0) && (
          <p className="mb-2 text-sm text-slate-500">Nenhuma movimentação realizada neste período.</p>
        )}
        {timeseries && <CashFlowChart daily={timeseries.daily} />}
      </Card>

      <Card className="mb-6">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Movimentações realizadas no período
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {timeseries?.transactions.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={4}>
                  Nenhuma movimentação realizada neste período.
                </td>
              </tr>
            )}
            {timeseries?.transactions.map((tx, index) => (
              <tr key={`${tx.date}-${index}`}>
                <td className="px-4 py-2 text-slate-600">{formatDate(tx.date)}</td>
                <td className="px-4 py-2 text-slate-900">{tx.description}</td>
                <td className="px-4 py-2 text-slate-600">{KIND_LABELS[tx.kind]}</td>
                <td className={`px-4 py-2 text-right font-medium ${tx.direction === "INFLOW" ? "text-emerald-600" : "text-red-600"}`}>
                  {tx.direction === "INFLOW" ? "+" : "-"} {formatMoney(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {loadingAging ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AgingTable
            title="Contas a pagar em aberto"
            rows={aging?.payables ?? []}
            nameOf={(row) => row.payable?.description ?? "—"}
          />
          <AgingTable
            title="Contas a receber em aberto"
            rows={aging?.receivables ?? []}
            nameOf={(row) => row.receivable?.description ?? "—"}
          />
        </div>
      )}
    </div>
  );
}
