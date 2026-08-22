import { Injectable } from '@nestjs/common';
import { prisma } from '@aritech/database';
import { CreateSupplierDto } from '../presentation/dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  list(legalEntityId: string) {
    return prisma.supplier.findMany({
      where: { legalEntityId },
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
      orderBy: { legalName: 'asc' },
    });
  }

  create(input: CreateSupplierDto) {
    return prisma.supplier.create({
      data: {
        legalEntityId: input.legalEntityId,
        legalName: input.legalName,
        tradeName: input.tradeName,
        taxDocument: input.taxDocument.replace(/\D/g, ''),
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        defaultPaymentTermId: input.defaultPaymentTermId,
        notes: input.notes,
        bankAccounts: input.bankAccounts ? { create: input.bankAccounts } : undefined,
        pixKeys: input.pixKeys ? { create: input.pixKeys } : undefined,
      },
      include: { defaultPaymentTerm: true, bankAccounts: true, pixKeys: true },
    });
  }
}
