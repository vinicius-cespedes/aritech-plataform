"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney, parseMoneyInput } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, Label, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { SupplierPicker } from "@/components/pickers/supplier-picker";
import { EmployeePicker } from "@/components/pickers/employee-picker";
import { CostAllocationFields, type CostAllocationValue } from "@/components/allocation-fields";

interface Payable {
  id: string;
  description: string;
  competenceDate: string;
  originalAmount: string;
  status: string;
  supplier?: { name: string } | null;
  employee?: { name: string } | null;
  costCenter?: { code: string; name: string } | null;
  contract?: { code: string; customer: { name: string } } | null;
  installments: Array<{ dueDate: string; notes?: string | null }>;
}
interface ManagementAccount {
  id: string;
  code: string;
  name: string;
}

function needsReview(installments: Array<{ notes?: string | null }>) {
  return installments.some((i) => i.notes?.startsWith("Importado automaticamente"));
}

export default function PayablesPage() {
  const queryClient = useQueryClient();
  const { data: payables, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: () => api.get<Payable[]>("/payables"),
  });
  const { data: managementAccounts } = useQuery({
    queryKey: ["management-accounts"],
    queryFn: () => api.get<ManagementAccount[]>("/management-accounts"),
  });

  const [showForm, setShowForm] = useState(false);
  const [beneficiaryKind, setBeneficiaryKind] = useState<"SUPPLIER" | "EMPLOYEE">("SUPPLIER");
  const [supplierId, setSupplierId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [description, setDescription] = useState("");
  const [competenceDate, setCompetenceDate] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [managementAccountId, setManagementAccountId] = useState("");
  const [allocation, setAllocation] = useState<CostAllocationValue>({ costCenterId: "", contractId: "", projectId: "" });
  const [onlyToReview, setOnlyToReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Payable>("/payables", {
        counterpartyType: beneficiaryKind,
        supplierId: beneficiaryKind === "SUPPLIER" ? supplierId : undefined,
        employeeId: beneficiaryKind === "EMPLOYEE" ? employeeId : undefined,
        description,
        competenceDate,
        firstDueDate,
        originalAmount: parseMoneyInput(amount),
        installmentsCount,
        managementAccountId,
        costCenterId: allocation.costCenterId,
        contractId: allocation.contractId || undefined,
        projectId: allocation.projectId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      setShowForm(false);
      setSupplierId("");
      setEmployeeId("");
      setDescription("");
      setAmount("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao criar conta a pagar."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Contas a pagar"
        description="Docx §8 — novos lançamentos entram inicialmente em aprovação."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Nova conta a pagar"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Beneficiário</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={beneficiaryKind === "SUPPLIER" ? "primary" : "secondary"}
                  onClick={() => setBeneficiaryKind("SUPPLIER")}
                >
                  Fornecedor
                </Button>
                <Button
                  type="button"
                  variant={beneficiaryKind === "EMPLOYEE" ? "primary" : "secondary"}
                  onClick={() => setBeneficiaryKind("EMPLOYEE")}
                >
                  Colaborador
                </Button>
              </div>
            </div>
            {beneficiaryKind === "SUPPLIER" ? (
              <SupplierPicker required value={supplierId} onChange={setSupplierId} />
            ) : (
              <EmployeePicker required value={employeeId} onChange={setEmployeeId} />
            )}
            <div className="lg:col-span-2">
              <Field label="Descrição *">
                <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
            <Field label="Conta gerencial *">
              <Select required value={managementAccountId} onChange={(e) => setManagementAccountId(e.target.value)}>
                <option value="">Selecione…</option>
                {managementAccounts?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <CostAllocationFields value={allocation} onChange={setAllocation} />
            <Field label="Valor total (R$) *">
              <Input required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1.000,00" />
            </Field>
            <Field label="Competência *">
              <Input type="date" required value={competenceDate} onChange={(e) => setCompetenceDate(e.target.value)} />
            </Field>
            <Field label="1º vencimento *">
              <Input type="date" required value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
            </Field>
            <Field label="Número de parcelas">
              <Input
                type="number"
                min={1}
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value) || 1)}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorBanner message={error} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <label className="mb-3 flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={onlyToReview} onChange={(e) => setOnlyToReview(e.target.checked)} />
        Mostrar só os lançamentos a revisar (importados com classificação provisória)
      </label>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Beneficiário</th>
              <th className="px-4 py-3">Centro de custo</th>
              <th className="px-4 py-3">Contrato</th>
              <th className="px-4 py-3">Competência</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  Carregando…
                </td>
              </tr>
            )}
            {payables?.filter((p) => !onlyToReview || needsReview(p.installments)).map((payable) => (
              <tr key={payable.id} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/financeiro/contas-a-pagar/${payable.id}`} className="font-medium text-brand-700 hover:underline">
                    {payable.description}
                  </Link>
                  {needsReview(payable.installments) && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">revisar</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{payable.supplier?.name ?? payable.employee?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{payable.costCenter ? `${payable.costCenter.code} — ${payable.costCenter.name}` : "—"}</td>
                <td className="px-4 py-3 text-slate-600">{payable.contract ? `${payable.contract.code} (${payable.contract.customer.name})` : "—"}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(payable.competenceDate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(payable.originalAmount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={payable.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
