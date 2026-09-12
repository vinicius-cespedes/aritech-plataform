import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCustomerInput } from "@aritech/validation";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(includeInactive = false) {
    return this.prisma.client.customer.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: { contacts: true },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const customer = await this.prisma.client.customer.findUnique({ where: { id }, include: { contacts: true } });
    if (!customer) throw new NotFoundException({ code: "NOT_FOUND", message: "Cliente não encontrado." });
    return customer;
  }

  async create(data: CreateCustomerInput, actorUserId: string) {
    const { contacts, ...fields } = data;
    const customer = await this.prisma.client.customer.create({
      data: {
        ...fields,
        contacts: contacts?.length ? { create: contacts.map(({ id: _id, ...c }) => c) } : undefined,
      },
      include: { contacts: true },
    });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.customer",
      action: "CREATE",
      entityType: "Customer",
      entityId: customer.id,
      source: "WEB",
      result: "SUCCESS",
      newValues: customer,
    });
    return customer;
  }

  /**
   * `contacts`, quando presente no payload, SUBSTITUI a lista inteira
   * (apaga e recria) — mais simples e correto que diff incremental para a
   * quantidade pequena de contatos esperada por fornecedor/cliente.
   */
  async update(id: string, data: Partial<CreateCustomerInput>, actorUserId: string) {
    const before = await this.get(id);
    const { contacts, ...fields } = data;

    const customer = await this.prisma.client.$transaction(async (tx) => {
      if (contacts) {
        await tx.contact.deleteMany({ where: { customerId: id } });
      }
      return tx.customer.update({
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
      module: "organization.customer",
      action: "UPDATE",
      entityType: "Customer",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
      previousValues: before,
      newValues: customer,
    });
    return customer;
  }

  /** Docx §6.1 — exclusão bloqueada quando existe movimentação financeira vinculada. */
  async deactivate(id: string, actorUserId: string) {
    await this.get(id);
    const linkedReceivables = await this.prisma.client.receivable.count({
      where: { customerId: id, status: { notIn: ["CANCELLED"] } },
    });
    if (linkedReceivables > 0) {
      throw new ConflictException({
        code: "VALIDATION_ERROR",
        message: "Não é possível inativar: existem contas a receber vinculadas a este cliente.",
      });
    }
    const customer = await this.prisma.client.customer.update({ where: { id }, data: { isActive: false } });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.customer",
      action: "DEACTIVATE",
      entityType: "Customer",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
    });
    return customer;
  }
}
