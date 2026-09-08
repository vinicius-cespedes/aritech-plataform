import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEmployeeInput } from "@aritech/validation";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(includeInactive = false) {
    return this.prisma.client.employee.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const employee = await this.prisma.client.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException({ code: "NOT_FOUND", message: "Colaborador não encontrado." });
    return employee;
  }

  async create(data: CreateEmployeeInput, actorUserId: string) {
    const employee = await this.prisma.client.employee.create({
      data: { ...data, admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined },
    });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.employee",
      action: "CREATE",
      entityType: "Employee",
      entityId: employee.id,
      source: "WEB",
      result: "SUCCESS",
      // Docx §6.3 — dados sensíveis (remuneração) não fazem parte deste cadastro; PIX/banco são mascarados na auditoria.
      newValues: { ...employee, pixKey: employee.pixKey ? "***" : null },
    });
    return employee;
  }

  async update(id: string, data: Partial<CreateEmployeeInput>, actorUserId: string) {
    const before = await this.get(id);
    const employee = await this.prisma.client.employee.update({
      where: { id },
      data: { ...data, admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined },
    });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.employee",
      action: "UPDATE",
      entityType: "Employee",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
      previousValues: { ...before, pixKey: before.pixKey ? "***" : null },
      newValues: { ...employee, pixKey: employee.pixKey ? "***" : null },
    });
    return employee;
  }

  async deactivate(id: string, actorUserId: string) {
    await this.get(id);
    const linkedPayables = await this.prisma.client.payable.count({
      where: { employeeId: id, status: { notIn: ["CANCELLED"] } },
    });
    if (linkedPayables > 0) {
      throw new ConflictException({
        code: "VALIDATION_ERROR",
        message: "Não é possível inativar: existem obrigações vinculadas a este colaborador.",
      });
    }
    const employee = await this.prisma.client.employee.update({ where: { id }, data: { isActive: false } });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "organization.employee",
      action: "DEACTIVATE",
      entityType: "Employee",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
    });
    return employee;
  }
}
