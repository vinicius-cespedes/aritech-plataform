import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { prisma } from '@aritech/database';
import { CreateSupplierDto } from '../presentation/dto/create-supplier.dto';
import { isValidBrazilianTaxDocument, normalizeTaxDocument } from '../domain/brazilian-tax-document';

@Injectable()
export class SuppliersService {
  list(legalEntityId: string) {
    return prisma.supplier.findMany({
      where: { legalEntityId },
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
      orderBy: [{ legalName: 'asc' }, { tradeName: 'asc' }],
    });
  }

  async create(input: CreateSupplierDto) {
    const legalName = input.legalName?.trim() || null;
    const tradeName = input.tradeName?.trim() || null;
    if (!legalName && !tradeName) throw new BadRequestException('Informe a razão social ou o nome fantasia do fornecedor.');

    const taxDocument = normalizeTaxDocument(input.taxDocument) || null;
    if (taxDocument && !isValidBrazilianTaxDocument(taxDocument)) throw new BadRequestException('CPF/CNPJ inválido. Verifique os dígitos informados.');
    if (taxDocument) {
      const existing = await prisma.supplier.findFirst({ where: { legalEntityId: input.legalEntityId, taxDocument } });
      if (existing) throw new ConflictException('Já existe um fornecedor cadastrado com este CPF/CNPJ.');
    }

    return prisma.supplier.create({
      data: {
        legalEntityId: input.legalEntityId,
        legalName, tradeName, taxDocument, industry: input.industry,
        contactName: input.contactName, contactEmail: input.contactEmail,
        contactPhoneCountryCode: input.contactPhoneCountryCode?.trim() || null,
        contactPhone: input.contactPhone?.replace(/\D/g, '') || null,
        defaultPaymentTermId: input.defaultPaymentTermId, notes: input.notes,
        bankAccounts: input.bankAccounts ? { create: input.bankAccounts } : undefined,
        pixKeys: input.pixKeys ? { create: input.pixKeys } : undefined,
      },
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
    });
  }
}
