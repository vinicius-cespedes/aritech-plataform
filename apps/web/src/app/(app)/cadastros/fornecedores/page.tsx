"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, PageHeader } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface Supplier {
  id: string;
  name: string;
  taxId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
}

const EMPTY_FORM = { name: "", taxId: "", contactEmail: "", contactPhone: "" };

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers"),
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

  function openEditForm(supplier: Supplier) {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      taxId: supplier.taxId ?? "",
      contactEmail: supplier.contactEmail ?? "",
      contactPhone: supplier.contactPhone ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  const payload = () => ({
    name: form.name,
    taxId: form.taxId || undefined,
    contactEmail: form.contactEmail || undefined,
    contactPhone: form.contactPhone || undefined,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post<Supplier>("/suppliers", payload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeForm();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar fornecedor."),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch<Supplier>(`/suppliers/${editingId}`, payload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeForm();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao atualizar fornecedor."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/suppliers/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
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
        title="Fornecedores"
        description="Cadastro de fornecedores — docx §6.1. A exclusão é bloqueada quando existe conta a pagar vinculada."
        action={
          <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
            {showForm ? "Cancelar" : "Novo fornecedor"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            {editingId ? "Editar fornecedor" : "Novo fornecedor"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Razão social *">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="CNPJ/CPF">
              <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
            </Field>
            <Field label="E-mail de contato">
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </Field>
            <Field label="Telefone de contato">
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <ErrorBanner message={error} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
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
              <th className="px-4 py-3">Razão social</th>
              <th className="px-4 py-3">CNPJ/CPF</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Carregando…
                </td>
              </tr>
            )}
            {suppliers?.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{supplier.name}</td>
                <td className="px-4 py-3 text-slate-600">{supplier.taxId ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{supplier.contactEmail ?? supplier.contactPhone ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={supplier.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="ghost" onClick={() => openEditForm(supplier)}>
                    Editar
                  </Button>
                  {supplier.isActive && (
                    <Button variant="ghost" onClick={() => deactivateMutation.mutate(supplier.id)}>
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
