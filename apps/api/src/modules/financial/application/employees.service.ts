import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@aritech/database';
import { CreateEmployeeDto } from '../presentation/dto/create-employee.dto';
import { isValidBrazilianTaxDocument, normalizeTaxDocument } from '../domain/brazilian-tax-document';

type EmployeeRow = {
  id:string; legalEntityId:string; name:string; taxDocument:string|null; employmentType:string|null;
  jobTitle:string|null; costCenterId:string|null; admissionDate:Date|null; bankName:string|null;
  branch:string|null; accountNumber:string|null; pixKey:string|null; status:string; notes:string|null;
};

@Injectable()
export class EmployeesService {
  async list(legalEntityId:string, search?:string) {
    const q = search?.trim();
    return prisma.$queryRaw<EmployeeRow[]>(Prisma.sql`
      SELECT id, legal_entity_id AS "legalEntityId", name, tax_document AS "taxDocument",
             employment_type AS "employmentType", job_title AS "jobTitle", cost_center_id AS "costCenterId",
             admission_date AS "admissionDate", bank_name AS "bankName", branch,
             account_number AS "accountNumber", pix_key AS "pixKey", status, notes
      FROM employees
      WHERE legal_entity_id = ${legalEntityId}::uuid
        AND status = 'ACTIVE'
        ${q ? Prisma.sql`AND (name ILIKE ${'%' + q + '%'} OR regexp_replace(COALESCE(tax_document,''),'\\D','','g') LIKE ${'%' + q.replace(/\D/g,'') + '%'})` : Prisma.empty}
      ORDER BY name ASC
      LIMIT 50
    `);
  }

  async create(input:CreateEmployeeDto) {
    const taxDocument = await this.validateCpf(input.legalEntityId, input.taxDocument);
    const rows = await prisma.$queryRaw<EmployeeRow[]>(Prisma.sql`
      INSERT INTO employees (legal_entity_id,name,tax_document,employment_type,job_title,cost_center_id,admission_date,bank_name,branch,account_number,pix_key,notes)
      VALUES (${input.legalEntityId}::uuid, ${input.name.trim()}, ${taxDocument}, ${input.employmentType ?? null}, ${input.jobTitle ?? null},
              ${input.costCenterId ?? null}::uuid, ${input.admissionDate ? new Date(input.admissionDate) : null}::date,
              ${input.bankName ?? null}, ${input.branch ?? null}, ${input.accountNumber ?? null}, ${input.pixKey ?? null}, ${input.notes ?? null})
      RETURNING id, legal_entity_id AS "legalEntityId", name, tax_document AS "taxDocument",
                employment_type AS "employmentType", job_title AS "jobTitle", cost_center_id AS "costCenterId",
                admission_date AS "admissionDate", bank_name AS "bankName", branch,
                account_number AS "accountNumber", pix_key AS "pixKey", status, notes
    `);
    return rows[0];
  }

  async update(id:string, input:CreateEmployeeDto) {
    const current = await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
      SELECT id FROM employees WHERE id=${id}::uuid AND legal_entity_id=${input.legalEntityId}::uuid AND status='ACTIVE' LIMIT 1
    `);
    if (!current.length) throw new NotFoundException('EMPLOYEE_NOT_FOUND');
    const taxDocument = await this.validateCpf(input.legalEntityId, input.taxDocument, id);
    const rows = await prisma.$queryRaw<EmployeeRow[]>(Prisma.sql`
      UPDATE employees SET
        name=${input.name.trim()}, tax_document=${taxDocument}, employment_type=${input.employmentType ?? null},
        job_title=${input.jobTitle ?? null}, cost_center_id=${input.costCenterId ?? null}::uuid,
        admission_date=${input.admissionDate ? new Date(input.admissionDate) : null}::date,
        bank_name=${input.bankName ?? null}, branch=${input.branch ?? null}, account_number=${input.accountNumber ?? null},
        pix_key=${input.pixKey ?? null}, notes=${input.notes ?? null}, updated_at=now()
      WHERE id=${id}::uuid
      RETURNING id, legal_entity_id AS "legalEntityId", name, tax_document AS "taxDocument",
                employment_type AS "employmentType", job_title AS "jobTitle", cost_center_id AS "costCenterId",
                admission_date AS "admissionDate", bank_name AS "bankName", branch,
                account_number AS "accountNumber", pix_key AS "pixKey", status, notes
    `);
    return rows[0];
  }

  async remove(id:string, legalEntityId:string) {
    const rows = await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
      UPDATE employees SET status='INACTIVE', updated_at=now()
      WHERE id=${id}::uuid AND legal_entity_id=${legalEntityId}::uuid AND status='ACTIVE'
      RETURNING id
    `);
    if (!rows.length) throw new NotFoundException('EMPLOYEE_NOT_FOUND');
    return { id, status:'INACTIVE' };
  }

  private async validateCpf(legalEntityId:string, value?:string, ignoreId?:string) {
    const taxDocument = normalizeTaxDocument(value) || null;
    if (taxDocument && (taxDocument.length !== 11 || !isValidBrazilianTaxDocument(taxDocument))) {
      throw new BadRequestException('CPF inválido. Verifique os dígitos informados.');
    }
    if (taxDocument) {
      const existing = await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
        SELECT id FROM employees
        WHERE legal_entity_id=${legalEntityId}::uuid AND tax_document=${taxDocument}
        ${ignoreId ? Prisma.sql`AND id <> ${ignoreId}::uuid` : Prisma.empty}
        LIMIT 1
      `);
      if (existing.length) throw new ConflictException('Já existe um colaborador com este CPF.');
    }
    return taxDocument;
  }
}
