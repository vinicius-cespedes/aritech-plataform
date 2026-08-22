import { Injectable } from '@nestjs/common';
import { prisma } from '@aritech/database';

@Injectable()
export class FinancialCatalogsService {
  async getCatalogs(legalEntityId: string) {
    const [managementAccounts, costCenters, businessLines, projects, financialAccounts, paymentTerms] = await Promise.all([
      prisma.managementAccount.findMany({ where: { status: 'ACTIVE', allowsPosting: true }, orderBy: [{ code: 'asc' }, { name: 'asc' }] }),
      prisma.costCenter.findMany({ where: { legalEntityId, status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
      prisma.businessLine.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
      prisma.project.findMany({ where: { legalEntityId, status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
      prisma.financialAccount.findMany({ where: { legalEntityId, status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
      prisma.paymentTerm.findMany({ where: { status: 'ACTIVE' }, include: { rules: { orderBy: { sequence: 'asc' } } }, orderBy: { name: 'asc' } }),
    ]);

    return { managementAccounts, costCenters, businessLines, projects, financialAccounts, paymentTerms };
  }
}
