"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui/primitives";

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
  const { data: summary } = useQuery({ queryKey: ["cashflow-summary"], queryFn: () => api.get<CashFlowSummary>("/cashflow/summary") });
  const { data: aging, isLoading } = useQuery({ queryKey: ["cashflow-aging"], queryFn: () => api.get<AgingResponse>("/cashflow/aging") });

  return (
    <div>
      <PageHeader
        title="Fluxo de caixa"
        description="Docx §14 — realizado (conciliado com OFX) e comprometido (aprovado, em aberto). Nível 'Previsto' fica para iteração futura."
      />

      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Realizado</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(summary.realized.net)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Comprometido</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(summary.committed.net)}</p>
          </Card>
        </div>
      )}

      {isLoading ? (
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
