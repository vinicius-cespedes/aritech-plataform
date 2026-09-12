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
      include: { contacts: true },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const supplier = await this.prisma.client.supplier.findUnique({ where: { id }, include: { contacts: true } });
    if (!supplier) throw new NotFoundException({ code: "NOT_FOUND", message: "Fornecedor não encontrado." });
    return supplier;
  }

  async create(data: CreateSupplierInput, actorUserId: string) {
    const { contacts, ...fields } = data;
    const supplier = await this.prisma.client.supplier.create({
      data: {
        ...fields,
        contacts: contacts?.length ? { create: contacts.map(({ id: _id, ...c }) => c) } : undefined,
      },
      include: { contacts: true },
    });
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

  /**
   * `contacts`, quando presente no payload, SUBSTITUI a lista inteira
   * (apaga e recria) — mais simples e correto que diff incremental para a
   * quantidade pequena de contatos esperada por fornecedor/cliente.
   */
  async update(id: string, data: Partial<CreateSupplierInput>, actorUserId: string) {
    const before = await this.get(id);
    const { contacts, ...fields } = data;
    const isBankDataChange = false; // dados bancários não fazem parte do cadastro de fornecedor no MVP.

    const supplier = await this.prisma.client.$transaction(async (tx) => {
      if (contacts) {
        await tx.contact.deleteMany({ where: { supplierId: id } });
      }
      return tx.supplier.update({
        where: { id },
        data: {
          ...fields,
          contacts: contacts ? { create: contacts.map(({ id: _id, ...c }) => c) } : undefined,
        },
        include: { contacts: true },
      });
    });

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
