"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SUPPLIER_BUSINESS_AREAS } from "@aritech/shared";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface Contact {
  id?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

interface Supplier {
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
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
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
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

function emptyContact(): Contact {
  return { name: "", role: "", email: "", phone: "", isPrimary: false };
}

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customBusinessArea, setCustomBusinessArea] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knownBusinessAreas = useMemo<readonly string[]>(() => SUPPLIER_BUSINESS_AREAS, []);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setContacts([]);
    setCustomBusinessArea(false);
    setError(null);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setContacts([]);
    setCustomBusinessArea(false);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(supplier: Supplier) {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      tradeName: supplier.tradeName ?? "",
      taxId: supplier.taxId ?? "",
      stateRegistration: supplier.stateRegistration ?? "",
      municipalRegistration: supplier.municipalRegistration ?? "",
      website: supplier.website ?? "",
      businessArea: supplier.businessArea ?? "",
      addressZip: supplier.addressZip ?? "",
      addressStreet: supplier.addressStreet ?? "",
      addressNumber: supplier.addressNumber ?? "",
      addressComplement: supplier.addressComplement ?? "",
      addressDistrict: supplier.addressDistrict ?? "",
      addressCity: supplier.addressCity ?? "",
      addressState: supplier.addressState ?? "",
      addressCountry: supplier.addressCountry ?? "BR",
      contactName: supplier.contactName ?? "",
      contactEmail: supplier.contactEmail ?? "",
      contactPhone: supplier.contactPhone ?? "",
      notes: supplier.notes ?? "",
    });
    setCustomBusinessArea(
      !!supplier.businessArea && !SUPPLIER_BUSINESS_AREAS.includes(supplier.businessArea as (typeof SUPPLIER_BUSINESS_AREAS)[number]),
    );
    setContacts(
      (supplier.contacts ?? []).map((c) => ({
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
    contactName: form.contactName || undefined,
    contactEmail: form.contactEmail || undefined,
    contactPhone: form.contactPhone || undefined,
    notes: form.notes || undefined,
    contacts: contacts
      .filter((c) => c.name.trim() !== "")
      .map((c) => ({ ...c, email: c.email || undefined, role: c.role || undefined, phone: c.phone || undefined })),
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
                <Field label="CNPJ/CPF">
                  <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
                </Field>
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
                  <Select
                    value={customBusinessArea ? "Outro" : form.businessArea}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "Outro") {
                        setCustomBusinessArea(true);
                        setForm({ ...form, businessArea: "" });
                      } else {
                        setCustomBusinessArea(false);
                        setForm({ ...form, businessArea: value });
                      }
                    }}
                  >
                    <option value="">Selecione…</option>
                    {knownBusinessAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </Select>
                  {customBusinessArea && (
                    <Input
                      className="mt-2"
                      placeholder="Especifique o ramo de atividade"
                      value={form.businessArea}
                      onChange={(e) => setForm({ ...form, businessArea: e.target.value })}
                    />
                  )}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Nome do contato">
                  <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                </Field>
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  />
                </Field>
                <Field label="Telefone">
                  <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
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
            {suppliers?.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{supplier.name}</td>
                <td className="px-4 py-3 text-slate-600">{supplier.taxId ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{supplier.businessArea ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {supplier.addressCity ? `${supplier.addressCity}/${supplier.addressState ?? ""}` : "—"}
                </td>
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
