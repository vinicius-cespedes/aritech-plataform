"use client";

import { Badge } from "./primitives";

const STATUS_LABELS: Record<string, { label: string; tone: "slate" | "green" | "amber" | "red" | "blue" }> = {
  DRAFT: { label: "Rascunho", tone: "slate" },
  PENDING_APPROVAL: { label: "Pendente de aprovação", tone: "amber" },
  APPROVED: { label: "Aprovada", tone: "blue" },
  OPEN: { label: "Em aberto", tone: "blue" },
  PARTIALLY_SETTLED: { label: "Parcialmente liquidada", tone: "amber" },
  SETTLED: { label: "Liquidada", tone: "green" },
  CANCELLED: { label: "Cancelada", tone: "slate" },
  WRITTEN_OFF: { label: "Baixada por perda", tone: "red" },
  CONFIRMED: { label: "Confirmado", tone: "blue" },
  RECONCILED: { label: "Conciliado", tone: "green" },
  REVERSED: { label: "Estornado", tone: "red" },
  PENDING: { label: "Pendente", tone: "amber" },
  UNRECONCILED: { label: "Não conciliado", tone: "slate" },
  SUGGESTED: { label: "Sugestão disponível", tone: "amber" },
  PARTIALLY_RECONCILED: { label: "Parcialmente conciliado", tone: "amber" },
  DIVERGENT: { label: "Divergente", tone: "red" },
  COMPLETED: { label: "Concluído", tone: "green" },
  COMPLETED_WITH_ERRORS: { label: "Concluído com erros", tone: "amber" },
  FAILED: { label: "Falhou", tone: "red" },
  CLOSED: { label: "Fechado", tone: "slate" },
  CLOSING: { label: "Fechando", tone: "amber" },
  REOPENED: { label: "Reaberto", tone: "blue" },
  ACTIVE: { label: "Ativo", tone: "green" },
  INACTIVE: { label: "Inativo", tone: "slate" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? { label: status, tone: "slate" as const };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
