import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CostCenterRow {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  contractId: string | null;
  status: string;
}

export interface ResultCenterRow {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  status: string;
}

export interface ContractRow {
  id: string;
  code: string;
  description: string | null;
  status: string;
  customerId: string;
  resultCenterId: string | null;
  amount: string | null;
  startDate: string | null;
  endDate: string | null;
  customer: { id: string; name: string };
  resultCenter: { id: string; code: string; name: string; parent: { id: string; code: string; name: string } | null } | null;
  costCenter: { id: string; code: string } | null;
  projects: Array<{ id: string; code: string; name: string }>;
}

export const PRODUCTION_CODE = "PRD";

export function useCostCenters() {
  return useQuery({ queryKey: ["cost-centers"], queryFn: () => api.get<CostCenterRow[]>("/cost-centers") });
}

export function useResultCenters() {
  return useQuery({ queryKey: ["result-centers"], queryFn: () => api.get<ResultCenterRow[]>("/result-centers") });
}

export function useContracts() {
  return useQuery({ queryKey: ["contracts"], queryFn: () => api.get<ContractRow[]>("/contracts") });
}

export function isProductionCostCenter(costCenter: CostCenterRow | undefined, all: CostCenterRow[]): boolean {
  let current = costCenter;
  for (let depth = 0; current && depth < 10; depth++) {
    if (current.code === PRODUCTION_CODE) return true;
    const parentId: string | null = current.parentId;
    current = parentId ? all.find((c) => c.id === parentId) : undefined;
  }
  return false;
}

/** Ordena a árvore (raiz, depois filhos) e informa a profundidade para indentação. */
export function flattenTree<T extends { id: string; code: string; parentId: string | null }>(
  rows: T[],
): Array<T & { depth: number }> {
  const byParent = new Map<string | null, T[]>();
  for (const row of rows) {
    const key = row.parentId && rows.some((r) => r.id === row.parentId) ? row.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), row]);
  }
  const out: Array<T & { depth: number }> = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const row of (byParent.get(parentId) ?? []).sort((a, b) => a.code.localeCompare(b.code))) {
      out.push({ ...row, depth });
      walk(row.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  CLOSED: "Encerrado",
};

export function businessLineName(contract: Pick<ContractRow, "resultCenter">): string {
  return contract.resultCenter?.parent?.name ?? "—";
}
