"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface CostCenter {
  id: string;
  code: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  taxId: string | null;
  employmentType: string | null;
  role: string | null;
  costCenterId: string | null;
  costCenter: CostCenter | null;
  admissionDate: string | null;
  pixKey: string | null;
  bankName: string | null;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: "",
  taxId: "",
  employmentType: "",
  role: "",
  costCenterId: "",
  admissionDate: "",
  pixKey: "",
  bankName: "",
};

const EMPLOYMENT_TYPES = ["CLT", "PJ", "Estagiário", "Temporário", "Sócio", "Outro"];

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get<Employee[]>("/employees"),
  });
  const { data: costCenters } = useQuery({
    queryKey: ["cost-centers"],
    queryFn: () => api.get<CostCenter[]>("/cost-centers"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      taxId: employee.taxId ?? "",
      employmentType: employee.employmentType ?? "",
      role: employee.role ?? "",
      costCenterId: employee.costCenterId ?? "",
      admissionDate: employee.admissionDate ? employee.admissionDate.slice(0, 10) : "",
      pixKey: employee.pixKey ?? "",
      bankName: employee.bankName ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  const payload = () => ({
    name: form.name,
    taxId: form.taxId || undefined,
    employmentType: form.employmentType || undefined,
    role: form.role || undefined,
    costCenterId: form.costCenterId || undefined,
    admissionDate: form.admissionDate || undefined,
    pixKey: form.pixKey || undefined,
    bankName: form.bankName || undefined,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post<Employee>("/employees", payload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      closeForm();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar colaborador."),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch<Employee>(`/employees/${editingId}`, payload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      closeForm();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao atualizar colaborador."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/employees/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        description="Cadastro de colaboradores — docx §6.3. Separado de fornecedores; dados de remuneração ficam fora deste cadastro (módulo de RH futuro)."
        action={
          <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
            {showForm ? "Cancelar" : "Novo colaborador"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            {editingId ? "Editar colaborador" : "Novo colaborador"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nome *">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="CPF">
              <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
            </Field>
            <Field label="Vínculo">
              <Select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                <option value="">Selecione…</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cargo/função">
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
            <Field label="Centro de custo">
              <Select value={form.costCenterId} onChange={(e) => setForm({ ...form, costCenterId: e.target.value })}>
                <option value="">Selecione…</option>
                {costCenters?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data de admissão">
              <Input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />
            </Field>
            <Field label="Chave PIX">
              <Input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} />
            </Field>
            <Field label="Banco">
              <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorBanner message={error} />
            </div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancelar edição
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Vínculo</th>
              <th className="px-4 py-3">Cargo/função</th>
              <th className="px-4 py-3">Centro de custo</th>
              <th className="px-4 py-3">Admissão</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3"></th>
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
            {employees?.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{employee.name}</td>
                <td className="px-4 py-3 text-slate-600">{employee.employmentType ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{employee.role ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {employee.costCenter ? `${employee.costCenter.code} — ${employee.costCenter.name}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(employee.admissionDate)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={employee.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="ghost" onClick={() => openEditForm(employee)}>
                    Editar
                  </Button>
                  {employee.isActive && (
                    <Button variant="ghost" onClick={() => deactivateMutation.mutate(employee.id)}>
                      Inativar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
