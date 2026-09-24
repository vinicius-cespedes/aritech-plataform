"use client";

import { Field, Select } from "@/components/ui/primitives";
import {
  businessLineName,
  flattenTree,
  isProductionCostCenter,
  useContracts,
  useCostCenters,
} from "@/lib/allocation";

export interface CostAllocationValue {
  costCenterId: string;
  contractId: string;
  projectId: string;
}

/**
 * Centro de custo + (quando for de Produção) contrato ativo e projeto.
 * Escolher um subcentro de contrato já define o contrato; escolher o centro
 * "Produção" pede o contrato.
 */
export function CostAllocationFields({
  value,
  onChange,
}: {
  value: CostAllocationValue;
  onChange: (next: CostAllocationValue) => void;
}) {
  const { data: costCenters } = useCostCenters();
  const { data: contracts } = useContracts();
  const all = costCenters ?? [];
  const selected = all.find((c) => c.id === value.costCenterId);
  const production = isProductionCostCenter(selected, all);
  const activeContracts = (contracts ?? []).filter((c) => c.status === "ACTIVE");
  const contract = (contracts ?? []).find((c) => c.id === value.contractId);

  function pickCostCenter(id: string) {
    const cc = all.find((c) => c.id === id);
    onChange({
      costCenterId: id,
      contractId: cc?.contractId ?? (isProductionCostCenter(cc, all) ? value.contractId : ""),
      projectId: "",
    });
  }

  function pickContract(id: string) {
    const picked = activeContracts.find((c) => c.id === id);
    onChange({
      costCenterId: picked?.costCenter?.id ?? value.costCenterId,
      contractId: id,
      projectId: "",
    });
  }

  return (
    <>
      <Field label="Centro de custo *">
        <Select required value={value.costCenterId} onChange={(e) => pickCostCenter(e.target.value)}>
          <option value="">Selecione…</option>
          {flattenTree(all).map((c) => (
            <option key={c.id} value={c.id}>
              {"  ".repeat(c.depth)}
              {c.depth > 0 ? "↳ " : ""}
              {c.code} — {c.name}
            </option>
          ))}
        </Select>
      </Field>
      {production && (
        <Field label="Contrato ativo *">
          <Select required value={value.contractId} onChange={(e) => pickContract(e.target.value)}>
            <option value="">Selecione…</option>
            {activeContracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.customer.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {contract && contract.projects.length > 1 && (
        <Field label="Projeto">
          <Select value={value.projectId} onChange={(e) => onChange({ ...value, projectId: e.target.value })}>
            <option value="">Selecione…</option>
            {contract.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </>
  );
}

export interface ReceivableAllocationValue {
  contractId: string;
  projectId: string;
}

/** Contrato ativo do cliente escolhido; linha de negócio e centro de resultado vêm dele. */
export function ReceivableAllocationFields({
  customerId,
  value,
  onChange,
}: {
  customerId: string;
  value: ReceivableAllocationValue;
  onChange: (next: ReceivableAllocationValue) => void;
}) {
  const { data: contracts } = useContracts();
  const options = (contracts ?? []).filter((c) => c.status === "ACTIVE" && (!customerId || c.customerId === customerId));
  const contract = (contracts ?? []).find((c) => c.id === value.contractId);

  return (
    <>
      <Field label="Contrato ativo *">
        <Select
          required
          value={value.contractId}
          onChange={(e) => onChange({ contractId: e.target.value, projectId: "" })}
        >
          <option value="">{customerId ? "Selecione…" : "Escolha o cliente primeiro"}</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </Select>
      </Field>
      {contract && (
        <p className="self-end pb-2 text-xs text-slate-500">
          Linha de negócio: <strong>{businessLineName(contract)}</strong>
        </p>
      )}
      {contract && contract.projects.length > 1 && (
        <Field label="Projeto">
          <Select value={value.projectId} onChange={(e) => onChange({ ...value, projectId: e.target.value })}>
            <option value="">Selecione…</option>
            {contract.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </>
  );
}
