import { Injectable } from "@nestjs/common";
import { Prisma } from "@aritech/database";
import { DomainError } from "@aritech/shared";

type Db = Prisma.TransactionClient;

export const PRODUCTION_COST_CENTER_CODE = "PRD";

export interface CostAllocationInput {
  costCenterId: string;
  contractId?: string | null;
  projectId?: string | null;
}

export interface CostAllocation {
  costCenterId: string;
  contractId: string | null;
  projectId: string | null;
}

export interface ReceivableAllocationInput {
  customerId: string;
  contractId: string;
  projectId?: string | null;
}

export interface ReceivableAllocation {
  contractId: string;
  projectId: string | null;
  resultCenterId: string;
}

/**
 * Regras de alocação que ligam cada lançamento a centro de custo, contrato,
 * projeto, centro de resultado e (por derivação) linha de negócio e cliente:
 *
 * - Toda conta a pagar tem centro de custo.
 * - Custo de Produção (centro "PRD" ou qualquer descendente) exige um
 *   contrato ativo e é lançado no subcentro de custo desse contrato.
 * - Toda conta a receber exige um contrato ativo do próprio cliente; o centro
 *   de resultado vem do contrato (e a linha de negócio, do centro de resultado).
 */
@Injectable()
export class AllocationService {
  async resolveCostAllocation(db: Db, input: CostAllocationInput): Promise<CostAllocation> {
    const costCenter = await db.costCenter.findUnique({ where: { id: input.costCenterId } });
    if (!costCenter) throw new DomainError("NOT_FOUND", "Centro de custo não encontrado.");

    let costCenterId = costCenter.id;
    let contractId = input.contractId ?? null;
    let projectId = input.projectId ?? null;

    if (!contractId && projectId) {
      const project = await db.project.findUnique({ where: { id: projectId } });
      if (!project) throw new DomainError("NOT_FOUND", "Projeto não encontrado.");
      contractId = project.contractId;
    }

    const production = await this.isProductionCostCenter(db, costCenter);

    if (production) {
      if (costCenter.contractId) {
        if (contractId && contractId !== costCenter.contractId) {
          throw new DomainError(
            "COST_CENTER_CONTRACT_MISMATCH",
            "O contrato informado não corresponde ao subcentro de custo escolhido.",
          );
        }
        contractId = costCenter.contractId;
      } else {
        if (!contractId) {
          throw new DomainError(
            "CONTRACT_REQUIRED_FOR_PRODUCTION",
            "Lançamentos do centro de custo de Produção precisam estar vinculados a um contrato ativo.",
          );
        }
        const subCenter = await db.costCenter.findUnique({ where: { contractId } });
        if (!subCenter) {
          throw new DomainError(
            "CONTRACT_INCOMPLETE",
            "O contrato ainda não possui subcentro de custo de Produção.",
          );
        }
        costCenterId = subCenter.id;
      }
    }

    if (!contractId) {
      if (projectId) projectId = null;
      return { costCenterId, contractId: null, projectId: null };
    }

    const contract = await this.getActiveContract(db, contractId);
    projectId = await this.resolveProject(db, contract.id, projectId);
    return { costCenterId, contractId: contract.id, projectId };
  }

  async resolveReceivableAllocation(db: Db, input: ReceivableAllocationInput): Promise<ReceivableAllocation> {
    if (!input.contractId) {
      throw new DomainError("CONTRACT_REQUIRED_FOR_RECEIVABLE", "Todo recebimento precisa estar vinculado a um contrato.");
    }
    const contract = await this.getActiveContract(db, input.contractId);
    if (contract.customerId !== input.customerId) {
      throw new DomainError("CONTRACT_CUSTOMER_MISMATCH", "O contrato informado pertence a outro cliente.");
    }
    if (!contract.resultCenterId) {
      throw new DomainError(
        "CONTRACT_INCOMPLETE",
        "O contrato não tem centro de resultado/linha de negócio definidos.",
      );
    }
    const projectId = await this.resolveProject(db, contract.id, input.projectId ?? null);
    return { contractId: contract.id, projectId, resultCenterId: contract.resultCenterId };
  }

  private async isProductionCostCenter(db: Db, costCenter: { code: string; parentId: string | null }): Promise<boolean> {
    let current: { code: string; parentId: string | null } | null = costCenter;
    for (let depth = 0; current && depth < 10; depth++) {
      if (current.code === PRODUCTION_COST_CENTER_CODE) return true;
      current = current.parentId
        ? await db.costCenter.findUnique({ where: { id: current.parentId }, select: { code: true, parentId: true } })
        : null;
    }
    return false;
  }

  private async getActiveContract(db: Db, contractId: string) {
    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new DomainError("NOT_FOUND", "Contrato não encontrado.");
    if (contract.status !== "ACTIVE") {
      throw new DomainError("CONTRACT_NOT_ACTIVE", `O contrato "${contract.code}" não está ativo.`);
    }
    return contract;
  }

  private async resolveProject(db: Db, contractId: string, projectId: string | null): Promise<string | null> {
    if (projectId) {
      const project = await db.project.findUnique({ where: { id: projectId } });
      if (!project || project.contractId !== contractId) {
        throw new DomainError("PROJECT_CONTRACT_MISMATCH", "O projeto informado não pertence ao contrato.");
      }
      return project.id;
    }
    const projects = await db.project.findMany({ where: { contractId }, select: { id: true }, take: 2 });
    return projects.length === 1 ? projects[0]!.id : null;
  }
}
