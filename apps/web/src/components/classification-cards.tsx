"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, Select } from "@/components/ui/primitives";
import { SupplierPicker } from "@/components/pickers/supplier-picker";
import { EmployeePicker } from "@/components/pickers/employee-picker";
import { CustomerPicker } from "@/components/pickers/customer-picker";
import {
  CostAllocationFields,
  ReceivableAllocationFields,
  type CostAllocationValue,
} from "@/components/allocation-fields";

interface ManagementAccount {
  id: string;
  code: string;
  name: string;
}

const COUNTERPARTY_LABEL: Record<string, string> = {
  SUPPLIER: "Fornecedor",
  EMPLOYEE: "Colaborador",
  PARTNER: "Sócio (retirada)",
  GOVERNMENT: "Governo",
  BANK: "Banco",
  OTHER: "Outros",
};

function useManagementAccounts() {
  return useQuery({
    queryKey: ["management-accounts"],
    queryFn: () => api.get<ManagementAccount[]>("/management-accounts"),
  });
}

function ReviewBanner({ pending, onConfirm }: { pending: boolean; onConfirm: () => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>Classificação provisória (importada automaticamente). Revise e confirme, ou edite o que estiver errado.</span>
      <Button type="button" variant="secondary" onClick={onConfirm} disabled={pending}>
        Confirmar classificação
      </Button>
    </div>
  );
}

function Summary({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="text-slate-900">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface PayableClassificationData {
  id: string;
  description: string;
  status: string;
  counterpartyType: string;
  supplierId: string | null;
  employeeId: string | null;
  costCenterId: string;
  managementAccountId: string;
  contractId: string | null;
  projectId: string | null;
  supplier?: { name: string } | null;
  employee?: { name: string } | null;
  costCenter?: { code: string; name: string } | null;
  managementAccount?: { code: string; name: string } | null;
  contract?: { code: string; customer: { name: string } } | null;
  project?: { name: string } | null;
  installments: Array<{ notes?: string | null }>;
}

export function PayableClassificationCard({ payable }: { payable: PayableClassificationData }) {
  const queryClient = useQueryClient();
  const { data: accounts } = useManagementAccounts();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(payable.description);
  const [counterpartyType, setCounterpartyType] = useState(payable.counterpartyType);
  const [supplierId, setSupplierId] = useState(payable.supplierId ?? "");
  const [employeeId, setEmployeeId] = useState(payable.employeeId ?? "");
  const [managementAccountId, setManagementAccountId] = useState(payable.managementAccountId);
  const [allocation, setAllocation] = useState<CostAllocationValue>({
    costCenterId: payable.costCenterId,
    contractId: payable.contractId ?? "",
    projectId: payable.projectId ?? "",
  });

  const toReview = payable.installments.some((i) => i.notes?.startsWith("Importado automaticamente"));
  const editable = payable.status !== "CANCELLED";

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch(`/payables/${payable.id}/classification`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payable", payable.id] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      setEditing(false);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao salvar a classificação."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate({
      description,
      counterpartyType,
      supplierId: counterpartyType === "SUPPLIER" ? supplierId : null,
      employeeId: counterpartyType === "EMPLOYEE" ? employeeId : null,
      managementAccountId,
      costCenterId: allocation.costCenterId,
      contractId: allocation.contractId || null,
      projectId: allocation.projectId || null,
    });
  }

  return (
    <Card className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Classificação</h2>
        {editable && !editing && (
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Editar classificação
          </Button>
        )}
      </div>
      {toReview && <ReviewBanner pending={saveMutation.isPending} onConfirm={() => saveMutation.mutate({})} />}
      <ErrorBanner message={error} />

      {!editing ? (
        <Summary
          items={[
            ["Contraparte", `${COUNTERPARTY_LABEL[payable.counterpartyType] ?? payable.counterpartyType}${
              payable.supplier?.name || payable.employee?.name ? ` — ${payable.supplier?.name ?? payable.employee?.name}` : ""
            }`],
            ["Conta gerencial", payable.managementAccount ? `${payable.managementAccount.code} — ${payable.managementAccount.name}` : ""],
            ["Centro de custo", payable.costCenter ? `${payable.costCenter.code} — ${payable.costCenter.name}` : ""],
            ["Contrato", payable.contract ? `${payable.contract.code} (${payable.contract.customer.name})` : ""],
            ["Projeto", payable.project?.name ?? ""],
          ]}
        />
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Field label="Descrição *">
              <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
          <Field label="Tipo de contraparte">
            <Select value={counterpartyType} onChange={(e) => setCounterpartyType(e.target.value)}>
              {Object.entries(COUNTERPARTY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          {counterpartyType === "SUPPLIER" && <SupplierPicker required value={supplierId} onChange={setSupplierId} />}
          {counterpartyType === "EMPLOYEE" && <EmployeePicker required value={employeeId} onChange={setEmployeeId} />}
          <Field label="Conta gerencial *">
            <Select required value={managementAccountId} onChange={(e) => setManagementAccountId(e.target.value)}>
              <option value="">Selecione…</option>
              {accounts?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <CostAllocationFields value={allocation} onChange={setAllocation} />
          <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar classificação"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export interface ReceivableClassificationData {
  id: string;
  description: string;
  status: string;
  customerId: string;
  managementAccountId: string;
  contractId: string | null;
  projectId: string | null;
  customer: { name: string };
  managementAccount?: { code: string; name: string } | null;
  contract?: { code: string } | null;
  project?: { name: string } | null;
  resultCenter?: { code: string; name: string; parent?: { name: string } | null } | null;
  installments: Array<{ notes?: string | null }>;
}

export function ReceivableClassificationCard({ receivable }: { receivable: ReceivableClassificationData }) {
  const queryClient = useQueryClient();
  const { data: accounts } = useManagementAccounts();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(receivable.description);
  const [customerId, setCustomerId] = useState(receivable.customerId);
  const [managementAccountId, setManagementAccountId] = useState(receivable.managementAccountId);
  const [contractId, setContractId] = useState(receivable.contractId ?? "");
  const [projectId, setProjectId] = useState(receivable.projectId ?? "");

  const toReview = receivable.installments.some((i) => i.notes?.startsWith("Importado automaticamente"));
  const editable = receivable.status !== "CANCELLED";

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch(`/receivables/${receivable.id}/classification`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivable", receivable.id] });
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      setEditing(false);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao salvar a classificação."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate({
      description,
      customerId,
      managementAccountId,
      contractId,
      projectId: projectId || null,
    });
  }

  return (
    <Card className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Classificação</h2>
        {editable && !editing && (
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Editar classificação
          </Button>
        )}
      </div>
      {toReview && <ReviewBanner pending={saveMutation.isPending} onConfirm={() => saveMutation.mutate({})} />}
      <ErrorBanner message={error} />

      {!editing ? (
        <Summary
          items={[
            ["Cliente", receivable.customer.name],
            ["Contrato", receivable.contract?.code ?? ""],
            ["Projeto", receivable.project?.name ?? ""],
            ["Linha de negócio", receivable.resultCenter?.parent?.name ?? ""],
            ["Centro de resultado", receivable.resultCenter ? `${receivable.resultCenter.code} — ${receivable.resultCenter.name}` : ""],
            ["Conta gerencial", receivable.managementAccount ? `${receivable.managementAccount.code} — ${receivable.managementAccount.name}` : ""],
          ]}
        />
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Field label="Descrição *">
              <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
          <CustomerPicker
            required
            value={customerId}
            onChange={(id) => {
              setCustomerId(id);
              setContractId("");
              setProjectId("");
            }}
          />
          <ReceivableAllocationFields
            customerId={customerId}
            value={{ contractId, projectId }}
            onChange={(v) => {
              setContractId(v.contractId);
              setProjectId(v.projectId);
            }}
          />
          <Field label="Conta gerencial *">
            <Select required value={managementAccountId} onChange={(e) => setManagementAccountId(e.target.value)}>
              <option value="">Selecione…</option>
              {accounts?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar classificação"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
