"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui/primitives";

interface CashFlowSummary {
  realized: { inflow: string; outflow: string; net: string };
  committed: { inflow: string; outflow: string; net: string };
  asOf: string;
}

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
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => api.get<CashFlowSummary>("/cashflow/summary"),
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do fluxo de caixa — realizado (pagamentos/recebimentos conciliados) e comprometido (títulos aprovados em aberto)."
      />
      {isLoading || !data ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard title="Realizado" {...data.realized} />
          <SummaryCard title="Comprometido" {...data.committed} />
        </div>
      )}
    </div>
  );
}
