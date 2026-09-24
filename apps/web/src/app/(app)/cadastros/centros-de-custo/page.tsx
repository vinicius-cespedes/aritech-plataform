"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, PageHeader } from "@/components/ui/primitives";
import { flattenTree } from "@/lib/allocation";

interface CostCenter {
  id: string;
  code: string;
  name: string;
  status: string;
  parentId: string | null;
  contractId: string | null;
}

interface ResultCenter {
  id: string;
  code: string;
  name: string;
  status: string;
  parentId: string | null;
}

function useCenterForm<T>(path: string, queryKey: string) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.post<T>(path, { code, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setCode("");
      setName("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar."),
  });

  return { code, setCode, name, setName, error, mutation };
}

export default function CostCentersPage() {
  const { data: costCenters, isLoading: loadingCC } = useQuery({
    queryKey: ["cost-centers"],
    queryFn: () => api.get<CostCenter[]>("/cost-centers"),
  });
  const { data: resultCenters, isLoading: loadingRC } = useQuery({
    queryKey: ["result-centers"],
    queryFn: () => api.get<ResultCenter[]>("/result-centers"),
  });

  const ccForm = useCenterForm<CostCenter>("/cost-centers", "cost-centers");
  const rcForm = useCenterForm<ResultCenter>("/result-centers", "result-centers");

  return (
    <div>
      <PageHeader
        title="Centros de custo e resultado"
        description="Centro de custo: área interna que consumiu o recurso; os subcentros de Produção são criados por contrato. Linha de negócio: agrupa os centros de resultado, um por contrato."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Centros de custo</h2>
          <Card className="mb-4 p-4">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                ccForm.mutation.mutate();
              }}
              className="flex items-end gap-3"
            >
              <div className="w-24">
                <Field label="Código">
                  <Input required value={ccForm.code} onChange={(e) => ccForm.setCode(e.target.value)} />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Nome">
                  <Input required value={ccForm.name} onChange={(e) => ccForm.setName(e.target.value)} />
                </Field>
              </div>
              <Button type="submit" disabled={ccForm.mutation.isPending}>
                Adicionar
              </Button>
            </form>
            <div className="mt-2">
              <ErrorBanner message={ccForm.error} />
            </div>
          </Card>
          <Card>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {loadingCC && (
                  <tr>
                    <td className="px-4 py-3 text-slate-500">Carregando…</td>
                  </tr>
                )}
                {costCenters && flattenTree(costCenters).map((cc) => (
                  <tr key={cc.id}>
                    <td className="w-20 px-4 py-2 font-mono text-slate-700">{cc.code}</td>
                    <td className="px-4 py-2 text-slate-900" style={{ paddingLeft: `${1 + cc.depth * 1.25}rem` }}>
                      {cc.depth > 0 ? "↳ " : ""}
                      {cc.name}
                      {cc.contractId && <span className="ml-2 text-xs text-slate-500">(subcentro de contrato)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Linhas de negócio e centros de resultado</h2>
          <Card className="mb-4 p-4">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                rcForm.mutation.mutate();
              }}
              className="flex items-end gap-3"
            >
              <div className="w-24">
                <Field label="Código">
                  <Input required value={rcForm.code} onChange={(e) => rcForm.setCode(e.target.value)} />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Nome">
                  <Input required value={rcForm.name} onChange={(e) => rcForm.setName(e.target.value)} />
                </Field>
              </div>
              <Button type="submit" disabled={rcForm.mutation.isPending}>
                Adicionar
              </Button>
            </form>
            <div className="mt-2">
              <ErrorBanner message={rcForm.error} />
            </div>
          </Card>
          <Card>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {loadingRC && (
                  <tr>
                    <td className="px-4 py-3 text-slate-500">Carregando…</td>
                  </tr>
                )}
                {resultCenters && flattenTree(resultCenters).map((rc) => (
                  <tr key={rc.id}>
                    <td className="w-20 px-4 py-2 font-mono text-slate-700">{rc.code}</td>
                    <td className="px-4 py-2 text-slate-900" style={{ paddingLeft: `${1 + rc.depth * 1.25}rem` }}>
                      {rc.depth > 0 ? "↳ " : ""}
                      {rc.name}
                      {rc.depth === 0 && <span className="ml-2 text-xs text-slate-500">(linha de negócio)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      </div>
    </div>
  );
}
