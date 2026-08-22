import { Injectable } from '@nestjs/common';
import { prisma } from '@aritech/database';
import { CreateFinancialAccountDto } from '../presentation/dto/create-financial-account.dto';

@Injectable()
export class FinancialAccountsService {
  async list(legalEntityId: string) {
    return prisma.financialAccount.findMany({
      where: { legalEntityId },
      orderBy: { name: 'asc' },
    });
  }

  async create(input: CreateFinancialAccountDto) {
    return prisma.financialAccount.create({
      data: {
        legalEntityId: input.legalEntityId,
        name: input.name,
        type: input.type,
        institutionName: input.institutionName,
        bankCode: input.bankCode,
        branch: input.branch,
        accountNumber: input.accountNumber,
        accountDigit: input.accountDigit,
        currency: input.currency,
        openingBalance: input.openingBalance,
        openingBalanceDate: new Date(input.openingBalanceDate),
        allowsReconciliation: input.allowsReconciliation ?? true,
      },
    });
  }
}
