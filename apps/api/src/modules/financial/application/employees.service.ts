import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@aritech/database';
import { CreateEmployeeDto } from '../presentation/dto/create-employee.dto';
import { isValidBrazilianTaxDocument, normalizeTaxDocument } from '../domain/brazilian-tax-document';
import { BadRequestException } from '@nestjs/common';

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
    const taxDocument = normalizeTaxDocument(input.taxDocument) || null;
    if (taxDocument && !isValidBrazilianTaxDocument(taxDocument)) throw new BadRequestException('CPF inválido.');
    if (taxDocument) {
      const existing = await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
        SELECT id FROM employees WHERE legal_entity_id=${input.legalEntityId}::uuid AND tax_document=${taxDocument} LIMIT 1
      `);
      if (existing.length) throw new ConflictException('Já existe um colaborador com este CPF.');
    }
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
}
