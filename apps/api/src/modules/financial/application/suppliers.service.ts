import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@aritech/database';
import { CreateSupplierDto } from '../presentation/dto/create-supplier.dto';
import { isValidBrazilianTaxDocument, normalizeTaxDocument } from '../domain/brazilian-tax-document';

@Injectable()
export class SuppliersService {
  list(legalEntityId: string, search?: string) {
    const term = search?.trim();
    return prisma.supplier.findMany({
      where: {
        legalEntityId,
        status: 'ACTIVE',
        ...(term ? {
          OR: [
            { legalName: { contains: term, mode: 'insensitive' } },
            { tradeName: { contains: term, mode: 'insensitive' } },
            { taxDocument: { contains: term.replace(/\D/g, '') } },
          ],
        } : {}),
      },
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
      orderBy: [{ legalName: 'asc' }, { tradeName: 'asc' }],
      take: term ? 20 : undefined,
    });
  }

  async create(input: CreateSupplierDto) {
    const normalized = await this.normalizeAndValidate(input);
    return prisma.supplier.create({
      data: {
        legalEntityId: input.legalEntityId,
        ...normalized,
        bankAccounts: input.bankAccounts ? { create: input.bankAccounts } : undefined,
        pixKeys: input.pixKeys ? { create: input.pixKeys } : undefined,
      },
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
    });
  }

  async update(id: string, input: CreateSupplierDto) {
    const current = await prisma.supplier.findFirst({ where: { id, legalEntityId: input.legalEntityId, status: 'ACTIVE' } });
    if (!current) throw new NotFoundException('SUPPLIER_NOT_FOUND');
    const normalized = await this.normalizeAndValidate(input, id);
    return prisma.supplier.update({
      where: { id },
      data: normalized,
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
    });
  }

  async remove(id: string, legalEntityId: string) {
    const current = await prisma.supplier.findFirst({ where: { id, legalEntityId, status: 'ACTIVE' } });
    if (!current) throw new NotFoundException('SUPPLIER_NOT_FOUND');
    await prisma.supplier.update({ where: { id }, data: { status: 'INACTIVE' } });
    return { id, status: 'INACTIVE' };
  }

  private async normalizeAndValidate(input: CreateSupplierDto, ignoreId?: string) {
    const legalName = input.legalName?.trim() || null;
    const tradeName = input.tradeName?.trim() || null;
    if (!legalName && !tradeName) throw new BadRequestException('Informe a razão social ou o nome fantasia do fornecedor.');

    const taxDocument = normalizeTaxDocument(input.taxDocument) || null;
    if (taxDocument && !isValidBrazilianTaxDocument(taxDocument)) throw new BadRequestException('CPF/CNPJ inválido. Verifique os dígitos informados.');
    if (taxDocument) {
      const existing = await prisma.supplier.findFirst({
        where: { legalEntityId: input.legalEntityId, taxDocument, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      });
      if (existing) throw new ConflictException('Já existe um fornecedor cadastrado com este CPF/CNPJ.');
    }

    return {
      legalName,
      tradeName,
      taxDocument,
      industry: input.industry,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhoneCountryCode: input.contactPhoneCountryCode?.trim() || null,
      contactPhone: input.contactPhone?.replace(/\D/g, '') || null,
      defaultPaymentTermId: input.defaultPaymentTermId,
      notes: input.notes,
    };
  }
}
