"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, PageHeader } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface Customer {
  id: string;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers"),
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => api.post<Customer>("/customers", { name, taxId: taxId || undefined, email: email || undefined, phone: phone || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setName("");
      setTaxId("");
      setEmail("");
      setPhone("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar cliente."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/customers/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes — docx §6.2. Reutilizado na criação de contratos e contas a receber."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "Novo cliente"}</Button>}
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
            <Field label="E-mail">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Telefone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
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
            {customers?.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                <td className="px-4 py-3 text-slate-600">{customer.taxId ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{customer.email ?? customer.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={customer.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-3 text-right">
                  {customer.isActive && (
                    <Button variant="ghost" onClick={() => deactivateMutation.mutate(customer.id)}>
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
