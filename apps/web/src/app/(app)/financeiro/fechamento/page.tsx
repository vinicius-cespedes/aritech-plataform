"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, PageHeader } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface FinancialPeriod {
  id: string;
  year: number;
  month: number;
  status: string;
}
interface ValidationIssue {
  code: string;
  count: number;
  amount?: string;
}
interface ValidationResult {
  canClose: boolean;
  blockingIssues: ValidationIssue[];
  warnings: ValidationIssue[];
}

export default function PeriodClosingPage() {
  const queryClient = useQueryClient();
  const { data: periods, isLoading } = useQuery({
    queryKey: ["financial-periods"],
    queryFn: () => api.get<FinancialPeriod[]>("/financial-periods"),
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["financial-periods"] });

  const validateMutation = useMutation({
    mutationFn: (id: string) => api.post<ValidationResult>(`/financial-periods/${id}/validate`),
    onSuccess: (result, id) => {
      setValidation(result);
      setSelectedId(id);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao validar período."),
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, acceptWarnings }: { id: string; acceptWarnings: boolean }) =>
      api.post(`/financial-periods/${id}/close`, { acceptWarnings }),
    onSuccess: () => {
      invalidate();
      setValidation(null);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao fechar período."),
  });

  const reopenMutation = useMutation({
    mutationFn: (id: string) => {
      const reason = window.prompt("Motivo da reabertura (obrigatório):");
      if (!reason) throw new Error("cancelled");
      return api.post(`/financial-periods/${id}/reopen`, { reason });
    },
    onSuccess: invalidate,
    onError: (err) => {
      if (err instanceof ApiError) setError(err.message);
    },
  });

  return (
    <div>
      <PageHeader
        title="Fechamento de período financeiro"
        description="ADR-008 — após o fechamento, lançamentos retroativos com esta competência ficam bloqueados até reabertura explícita."
      />
      <ErrorBanner message={error} />

      <Card className="mb-6">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={3}>
                  Carregando…
                </td>
              </tr>
            )}
            {periods?.map((period) => (
              <tr key={period.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {String(period.month).padStart(2, "0")}/{period.year}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={period.status} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="secondary" onClick={() => validateMutation.mutate(period.id)}>
                    Validar
                  </Button>
                  {(period.status === "OPEN" || period.status === "REOPENED") && (
                    <Button onClick={() => closeMutation.mutate({ id: period.id, acceptWarnings: false })}>Fechar</Button>
                  )}
                  {period.status === "CLOSED" && (
                    <Button variant="danger" onClick={() => reopenMutation.mutate(period.id)}>
                      Reabrir
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selectedId && validation && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Resultado da validação — {validation.canClose ? "pode fechar" : "não pode fechar"}
          </h2>
          {validation.blockingIssues.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase text-red-600">Bloqueios</p>
              <ul className="list-inside list-disc text-sm text-slate-700">
                {validation.blockingIssues.map((issue) => (
                  <li key={issue.code}>
                    {issue.code}: {issue.count} ocorrência(s){issue.amount ? ` — ${issue.amount}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase text-amber-600">Avisos</p>
              <ul className="list-inside list-disc text-sm text-slate-700">
                {validation.warnings.map((issue) => (
                  <li key={issue.code}>
                    {issue.code}: {issue.count} ocorrência(s){issue.amount ? ` — ${issue.amount}` : ""}
                  </li>
                ))}
              </ul>
              <Button className="mt-2" onClick={() => closeMutation.mutate({ id: selectedId, acceptWarnings: true })}>
                Fechar mesmo assim (aceitar avisos)
              </Button>
            </div>
          )}
          {validation.blockingIssues.length === 0 && validation.warnings.length === 0 && (
            <p className="text-sm text-emerald-600">Nenhuma pendência encontrada.</p>
          )}
        </Card>
      )}
    </div>
  );
}
