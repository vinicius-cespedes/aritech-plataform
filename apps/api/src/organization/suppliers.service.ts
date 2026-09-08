import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateSupplierInput } from "@aritech/validation";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(includeInactive = false) {
    return this.prisma.client.supplier.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const supplier = await this.prisma.client.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException({ code: "NOT_FOUND", message: "Fornecedor não encontrado." });
    return supplier;
  }

  async create(data: CreateSupplierInput, actorUserId: string) {
    const supplier = await this.prisma.client.supplier.create({ data });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.supplier",
      action: "CREATE",
      entityType: "Supplier",
      entityId: supplier.id,
      source: "WEB",
      result: "SUCCESS",
      newValues: supplier,
    });
    return supplier;
  }

  async update(id: string, data: Partial<CreateSupplierInput>, actorUserId: string) {
    const before = await this.get(id);
    const isBankDataChange = false; // dados bancários não fazem parte do cadastro de fornecedor no MVP.
    const supplier = await this.prisma.client.supplier.update({ where: { id }, data });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.supplier",
      action: "UPDATE",
      entityType: "Supplier",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
      previousValues: before,
      newValues: supplier,
      metadata: { isBankDataChange },
    });
    return supplier;
  }

  /** Docx §6.1 — "A exclusão é bloqueada quando existe movimentação financeira vinculada." */
  async deactivate(id: string, actorUserId: string) {
    await this.get(id);
    const linkedPayables = await this.prisma.client.payable.count({
      where: { supplierId: id, status: { notIn: ["CANCELLED"] } },
    });
    if (linkedPayables > 0) {
      throw new ConflictException({
        code: "VALIDATION_ERROR",
        message: "Não é possível inativar: existem contas a pagar vinculadas a este fornecedor.",
      });
    }
    const supplier = await this.prisma.client.supplier.update({ where: { id }, data: { isActive: false } });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.supplier",
      action: "DEACTIVATE",
      entityType: "Supplier",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
    });
    return supplier;
  }
}
