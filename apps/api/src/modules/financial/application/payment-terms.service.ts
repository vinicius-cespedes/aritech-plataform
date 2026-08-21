import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@aritech/database';
import { CreatePaymentTermDto } from '../presentation/dto/create-payment-term.dto';

@Injectable()
export class PaymentTermsService {
  list() {
    return prisma.paymentTerm.findMany({ include: { rules: { orderBy: { sequence: 'asc' } } }, orderBy: { code: 'asc' } });
  }

  create(input: CreatePaymentTermDto) {
    const total = input.rules.reduce((sum, rule) => sum.plus(new Prisma.Decimal(rule.percentage)), new Prisma.Decimal(0));
    if (!total.equals(100)) throw new BadRequestException('PAYMENT_TERM_PERCENTAGE_MUST_TOTAL_100');

    return prisma.paymentTerm.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        rules: { create: input.rules.map((r) => ({ sequence: r.sequence, daysAfterBase: r.daysAfterBase, percentage: r.percentage })) },
      },
      include: { rules: { orderBy: { sequence: 'asc' } } },
    });
  }
}
