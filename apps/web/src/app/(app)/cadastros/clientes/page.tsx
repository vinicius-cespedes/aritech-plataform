"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, PageHeader } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaxIdField } from "@/components/ui/tax-id-field";

interface Contact {
  id?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

interface Customer {
  id: string;
  name: string;
  tradeName: string | null;
  taxId: string | null;
  stateRegistration: string | null;
  municipalRegistration: string | null;
  website: string | null;
  businessArea: string | null;
  addressZip: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressDistrict: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressCountry: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  contacts: Contact[];
}

const EMPTY_FORM = {
  name: "",
  tradeName: "",
  taxId: "",
  stateRegistration: "",
  municipalRegistration: "",
  website: "",
  businessArea: "",
  addressZip: "",
  addressStreet: "",
  addressNumber: "",
  addressComplement: "",
  addressDistrict: "",
  addressCity: "",
  addressState: "",
  addressCountry: "BR",
  email: "",
  phone: "",
  notes: "",
};

function emptyContact(): Contact {
  return { name: "", role: "", email: "", phone: "", isPrimary: false };
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setContacts([]);
    setError(null);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setContacts([]);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      tradeName: customer.tradeName ?? "",
      taxId: customer.taxId ?? "",
      stateRegistration: customer.stateRegistration ?? "",
      municipalRegistration: customer.municipalRegistration ?? "",
      website: customer.website ?? "",
      businessArea: customer.businessArea ?? "",
      addressZip: customer.addressZip ?? "",
      addressStreet: customer.addressStreet ?? "",
      addressNumber: customer.addressNumber ?? "",
      addressComplement: customer.addressComplement ?? "",
      addressDistrict: customer.addressDistrict ?? "",
      addressCity: customer.addressCity ?? "",
      addressState: customer.addressState ?? "",
      addressCountry: customer.addressCountry ?? "BR",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      notes: customer.notes ?? "",
    });
    setContacts(
      (customer.contacts ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        role: c.role ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        isPrimary: c.isPrimary,
      })),
    );
    setError(null);
    setShowForm(true);
  }

  function updateContact(index: number, patch: Partial<Contact>) {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  const payload = () => ({
    ...form,
    tradeName: form.tradeName || undefined,
    taxId: form.taxId || undefined,
    stateRegistration: form.stateRegistration || undefined,
    municipalRegistration: form.municipalRegistration || undefined,
    website: form.website || undefined,
    businessArea: form.businessArea || undefined,
    addressZip: form.addressZip || undefined,
    addressStreet: form.addressStreet || undefined,
    addressNumber: form.addressNumber || undefined,
    addressComplement: form.addressComplement || undefined,
    addressDistrict: form.addressDistrict || undefined,
    addressCity: form.addressCity || undefined,
    addressState: form.addressState || undefined,
    addressCountry: form.addressCountry || undefined,
    email: form.email || undefined,
    phone: form.phone || undefined,
    notes: form.notes || undefined,
    contacts: contacts
      .filter((c) => c.name.trim() !== "")
      .map((c) => ({ ...c, email: c.email || undefined, role: c.role || undefined, phone: c.phone || undefined })),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post<Customer>("/customers", payload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeForm();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao cadastrar cliente."),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch<Customer>(`/customers/${editingId}`, payload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeForm();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao atualizar cliente."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/customers/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
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
        title="Clientes"
        description="Cadastro de clientes — docx §6.2. Reutilizado na criação de contratos e contas a receber."
        action={
          <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
            {showForm ? "Cancelar" : "Novo cliente"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{editingId ? "Editar cliente" : "Novo cliente"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Dados gerais</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Razão social *">
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Nome fantasia">
                  <Input value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} />
                </Field>
                <TaxIdField value={form.taxId} onChange={(taxId) => setForm({ ...form, taxId })} />
                <Field label="Inscrição estadual">
                  <Input
                    value={form.stateRegistration}
                    onChange={(e) => setForm({ ...form, stateRegistration: e.target.value })}
                  />
                </Field>
                <Field label="Inscrição municipal">
                  <Input
                    value={form.municipalRegistration}
                    onChange={(e) => setForm({ ...form, municipalRegistration: e.target.value })}
                  />
                </Field>
                <Field label="Ramo de atividade">
                  <Input
                    value={form.businessArea}
                    onChange={(e) => setForm({ ...form, businessArea: e.target.value })}
                    placeholder="Ex.: Engenharia / EPC"
                  />
                </Field>
                <Field label="Site">
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Endereço</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="CEP">
                  <Input value={form.addressZip} onChange={(e) => setForm({ ...form, addressZip: e.target.value })} />
                </Field>
                <div className="lg:col-span-2">
                  <Field label="Logradouro">
                    <Input
                      value={form.addressStreet}
                      onChange={(e) => setForm({ ...form, addressStreet: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Número">
                  <Input
                    value={form.addressNumber}
                    onChange={(e) => setForm({ ...form, addressNumber: e.target.value })}
                  />
                </Field>
                <Field label="Complemento">
                  <Input
                    value={form.addressComplement}
                    onChange={(e) => setForm({ ...form, addressComplement: e.target.value })}
                  />
                </Field>
                <Field label="Bairro">
                  <Input
                    value={form.addressDistrict}
                    onChange={(e) => setForm({ ...form, addressDistrict: e.target.value })}
                  />
                </Field>
                <Field label="Cidade">
                  <Input value={form.addressCity} onChange={(e) => setForm({ ...form, addressCity: e.target.value })} />
                </Field>
                <Field label="UF">
                  <Input
                    value={form.addressState}
                    maxLength={2}
                    onChange={(e) => setForm({ ...form, addressState: e.target.value.toUpperCase() })}
                  />
                </Field>
                <Field label="País">
                  <Input
                    value={form.addressCountry}
                    onChange={(e) => setForm({ ...form, addressCountry: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contato principal</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="E-mail">
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Telefone">
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contatos adicionais</p>
                <Button type="button" variant="secondary" onClick={() => setContacts((prev) => [...prev, emptyContact()])}>
                  + Adicionar contato
                </Button>
              </div>
              {contacts.length === 0 && <p className="text-sm text-slate-500">Nenhum contato adicional.</p>}
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-5">
                    <Input
                      placeholder="Nome *"
                      value={contact.name}
                      onChange={(e) => updateContact(index, { name: e.target.value })}
                    />
                    <Input
                      placeholder="Cargo/função"
                      value={contact.role ?? ""}
                      onChange={(e) => updateContact(index, { role: e.target.value })}
                    />
                    <Input
                      placeholder="E-mail"
                      type="email"
                      value={contact.email ?? ""}
                      onChange={(e) => updateContact(index, { email: e.target.value })}
                    />
                    <Input
                      placeholder="Telefone"
                      value={contact.phone ?? ""}
                      onChange={(e) => updateContact(index, { phone: e.target.value })}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeContact(index)}>
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Field label="Observações">
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>

            <ErrorBanner message={error} />
            <div className="flex gap-2">
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
              <th className="px-4 py-3">Ramo de atividade</th>
              <th className="px-4 py-3">Cidade/UF</th>
              <th className="px-4 py-3">Contato</th>
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
            {customers?.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                <td className="px-4 py-3 text-slate-600">{customer.taxId ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{customer.businessArea ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {customer.addressCity ? `${customer.addressCity}/${customer.addressState ?? ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{customer.email ?? customer.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={customer.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="ghost" onClick={() => openEditForm(customer)}>
                    Editar
                  </Button>
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
