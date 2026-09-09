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

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers"),
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => api.post<Supplier>("/suppliers", { name, taxId: taxId || undefined, contactEmail: contactEmail || undefined, contactPhone: contactPhone || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setShowForm(false);
      setName("");
      setTaxId("");
      setContactEmail("");
      setContactPhone("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar fornecedor."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/suppliers/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        description="Cadastro de fornecedores — docx §6.1. A exclusão é bloqueada quando existe conta a pagar vinculada."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo fornecedor"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Razão social *">
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="CNPJ/CPF">
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </Field>
            <Field label="E-mail de contato">
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Field>
            <Field label="Telefone de contato">
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <ErrorBanner message={error} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
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
                <td className="px-4 py-3 text-right">
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
