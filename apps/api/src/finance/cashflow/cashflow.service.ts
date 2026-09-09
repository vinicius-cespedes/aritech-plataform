import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

export interface CashFlowSummary {
  realized: { inflow: string; outflow: string; net: string };
  committed: { inflow: string; outflow: string; net: string };
  asOf: string;
}

/**
 * Fluxo de caixa — docx §14 e FINANCIAL_MODEL §40-41.
 * Nesta primeira iteração cobre os dois níveis de certeza mais concretos:
 * "Realizado" (pagamentos/recebimentos confirmados) e "Comprometido" (contas
 * a pagar/receber aprovadas e ainda em aberto). O nível "Previsto" (contratos,
 * medições futuras, cenários) fica para uma iteração posterior, quando os
 * módulos de Contratos/Projetos completos existirem — FINANCIAL_MODEL §31.
 */
@Injectable()
export class CashFlowService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<CashFlowSummary> {
    const [payments, receipts, openPayables, openReceivables] = await Promise.all([
      this.prisma.client.payment.aggregate({
        where: { status: { in: ["CONFIRMED", "RECONCILED"] } },
        _sum: { amount: true },
      }),
      this.prisma.client.receipt.aggregate({
        where: { status: { in: ["CONFIRMED", "RECONCILED"] } },
        _sum: { amount: true },
      }),
      this.prisma.client.payableInstallment.aggregate({
        where: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] }, payable: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] } } },
        _sum: { openAmount: true },
      }),
      this.prisma.client.receivableInstallment.aggregate({
        where: {
          status: { in: ["OPEN", "PARTIALLY_SETTLED"] },
          receivable: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] } },
        },
        _sum: { openAmount: true },
      }),
    ]);

    const realizedOutflow = Number(payments._sum.amount ?? 0);
    const realizedInflow = Number(receipts._sum.amount ?? 0);
    const committedOutflow = Number(openPayables._sum.openAmount ?? 0);
    const committedInflow = Number(openReceivables._sum.openAmount ?? 0);

    return {
      realized: {
        inflow: realizedInflow.toFixed(4),
        outflow: realizedOutflow.toFixed(4),
        net: (realizedInflow - realizedOutflow).toFixed(4),
      },
      committed: {
        inflow: committedInflow.toFixed(4),
        outflow: committedOutflow.toFixed(4),
        net: (committedInflow - committedOutflow).toFixed(4),
      },
      asOf: new Date().toISOString(),
    };
  }

  /** Aging simples de contas a pagar/receber em aberto — FINANCIAL_MODEL §51.6. */
  async aging() {
    const [payables, receivables] = await Promise.all([
      this.prisma.client.payableInstallment.findMany({
        where: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] } },
        include: { payable: { include: { supplier: true, employee: true } } },
        orderBy: { dueDate: "asc" },
      }),
      this.prisma.client.receivableInstallment.findMany({
        where: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] } },
        include: { receivable: { include: { customer: true } } },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    const today = new Date();
    const withAge = <T extends { dueDate: Date }>(items: T[]) =>
      items.map((item) => ({
        ...item,
        daysOverdue: Math.max(0, Math.floor((today.getTime() - item.dueDate.getTime()) / 86_400_000)),
      }));

    return { payables: withAge(payables), receivables: withAge(receivables) };
  }
}
