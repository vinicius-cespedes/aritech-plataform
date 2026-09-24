import { DomainError } from "@aritech/shared";
import { AllocationService } from "./allocation.service";

type CostCenter = { id: string; code: string; parentId: string | null; contractId: string | null };
type Contract = { id: string; code: string; status: string; customerId: string; resultCenterId: string | null };
type Project = { id: string; contractId: string | null };

function makeDb(data: { costCenters: CostCenter[]; contracts: Contract[]; projects: Project[] }) {
  return {
    costCenter: {
      findUnique: async ({ where }: { where: { id?: string; contractId?: string } }) =>
        data.costCenters.find((c) => (where.id ? c.id === where.id : c.contractId === where.contractId)) ?? null,
    },
    contract: {
      findUnique: async ({ where }: { where: { id: string } }) => data.contracts.find((c) => c.id === where.id) ?? null,
    },
    project: {
      findUnique: async ({ where }: { where: { id: string } }) => data.projects.find((p) => p.id === where.id) ?? null,
      findMany: async ({ where }: { where: { contractId: string } }) =>
        data.projects.filter((p) => p.contractId === where.contractId),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const base = {
  costCenters: [
    { id: "adm", code: "ADM", parentId: null, contractId: null },
    { id: "prd", code: "PRD", parentId: null, contractId: null },
    { id: "prd-a", code: "PRD-01", parentId: "prd", contractId: "ct-a" },
    { id: "prd-b", code: "PRD-02", parentId: "prd", contractId: "ct-b" },
  ],
  contracts: [
    { id: "ct-a", code: "A", status: "ACTIVE", customerId: "cli-1", resultCenterId: "rc-a" },
    { id: "ct-b", code: "B", status: "CLOSED", customerId: "cli-2", resultCenterId: "rc-b" },
    { id: "ct-c", code: "C", status: "ACTIVE", customerId: "cli-1", resultCenterId: null },
  ],
  projects: [
    { id: "pj-a", contractId: "ct-a" },
    { id: "pj-b1", contractId: "ct-b" },
    { id: "pj-b2", contractId: "ct-b" },
  ],
};

const service = new AllocationService();

async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
  return "OK";
}

describe("AllocationService.resolveCostAllocation", () => {
  const db = makeDb(base);

  it("aceita custo administrativo sem contrato", async () => {
    await expect(service.resolveCostAllocation(db, { costCenterId: "adm" })).resolves.toEqual({
      costCenterId: "adm",
      contractId: null,
      projectId: null,
    });
  });

  it("exige contrato para o centro de Produção", async () => {
    expect(await codeOf(service.resolveCostAllocation(db, { costCenterId: "prd" }))).toBe("CONTRACT_REQUIRED_FOR_PRODUCTION");
  });

  it("redireciona Produção + contrato para o subcentro do contrato e usa o projeto único", async () => {
    await expect(service.resolveCostAllocation(db, { costCenterId: "prd", contractId: "ct-a" })).resolves.toEqual({
      costCenterId: "prd-a",
      contractId: "ct-a",
      projectId: "pj-a",
    });
  });

  it("deriva o contrato a partir do subcentro escolhido", async () => {
    const result = await service.resolveCostAllocation(db, { costCenterId: "prd-a" });
    expect(result.contractId).toBe("ct-a");
  });

  it("rejeita contrato diferente do subcentro", async () => {
    expect(await codeOf(service.resolveCostAllocation(db, { costCenterId: "prd-a", contractId: "ct-c" }))).toBe(
      "COST_CENTER_CONTRACT_MISMATCH",
    );
  });

  it("rejeita contrato inativo", async () => {
    expect(await codeOf(service.resolveCostAllocation(db, { costCenterId: "prd-b" }))).toBe("CONTRACT_NOT_ACTIVE");
  });

  it("rejeita projeto de outro contrato", async () => {
    expect(await codeOf(service.resolveCostAllocation(db, { costCenterId: "prd-a", projectId: "pj-b1" }))).toBe(
      "COST_CENTER_CONTRACT_MISMATCH",
    );
  });
});

describe("AllocationService.resolveReceivableAllocation", () => {
  const db = makeDb(base);

  it("deriva centro de resultado e projeto do contrato", async () => {
    await expect(
      service.resolveReceivableAllocation(db, { customerId: "cli-1", contractId: "ct-a" }),
    ).resolves.toEqual({ contractId: "ct-a", projectId: "pj-a", resultCenterId: "rc-a" });
  });

  it("rejeita contrato de outro cliente", async () => {
    expect(await codeOf(service.resolveReceivableAllocation(db, { customerId: "cli-2", contractId: "ct-a" }))).toBe(
      "CONTRACT_CUSTOMER_MISMATCH",
    );
  });

  it("rejeita contrato sem centro de resultado", async () => {
    expect(await codeOf(service.resolveReceivableAllocation(db, { customerId: "cli-1", contractId: "ct-c" }))).toBe(
      "CONTRACT_INCOMPLETE",
    );
  });

  it("rejeita contrato inativo", async () => {
    expect(await codeOf(service.resolveReceivableAllocation(db, { customerId: "cli-2", contractId: "ct-b" }))).toBe(
      "CONTRACT_NOT_ACTIVE",
    );
  });
});
