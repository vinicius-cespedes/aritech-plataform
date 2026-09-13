import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

export interface CashFlowSummary {
  realized: { inflow: string; outflow: string; net: string };
  committed: { inflow: string; outflow: string; net: string };
  asOf: string;
}

export interface CashFlowDailyPoint {
  date: string; // YYYY-MM-DD
  realizedInflow: string;
  realizedOutflow: string;
  realizedNet: string;
  cumulativeRealizedNet: string;
  committedInflow: string;
  committedOutflow: string;
}

export type CashFlowTransactionKind = "PAYMENT" | "RECEIPT" | "BANK_FEE" | "FINANCIAL_INCOME" | "ADVANCE" | "OTHER";

export interface CashFlowTransactionRow {
  date: string; // YYYY-MM-DD
  kind: CashFlowTransactionKind;
  direction: "INFLOW" | "OUTFLOW";
  amount: string;
  description: string;
}

export interface CashFlowTimeseries {
  from: string;
  to: string;
  daily: CashFlowDailyPoint[];
  transactions: CashFlowTransactionRow[];
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
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
    const [payments, receipts, openPayables, openReceivables, otherMatches] = await Promise.all([
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
      // Classificações leves de conciliação sem Payment/Receipt (tarifa,
      // rendimento, adiantamento, diverso — ADR-009 §25/§47-48): também são
      // caixa realizado, e sem isso ficavam invisíveis no fluxo de caixa.
      // TRANSFER fica de fora de propósito — não é despesa nem receita, é
      // neutra no consolidado (ADR-009 §51).
      this.prisma.client.reconciliationMatch.findMany({
        where: { status: "ACTIVE", targetType: { in: ["BANK_FEE", "FINANCIAL_INCOME", "ADVANCE", "OTHER"] } },
        select: { matchedAmount: true, bankTransaction: { select: { direction: true } } },
      }),
    ]);

    const otherInflow = otherMatches
      .filter((m) => m.bankTransaction.direction === "CREDIT")
      .reduce((sum, m) => sum + Number(m.matchedAmount), 0);
    const otherOutflow = otherMatches
      .filter((m) => m.bankTransaction.direction === "DEBIT")
      .reduce((sum, m) => sum + Number(m.matchedAmount), 0);

    const realizedOutflow = Number(payments._sum.amount ?? 0) + otherOutflow;
    const realizedInflow = Number(receipts._sum.amount ?? 0) + otherInflow;
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

  /**
   * Fluxo de caixa diário — FINANCIAL_MODEL §40 ("fluxo de caixa diário" é
   * citado explicitamente como projeção de leitura). Diferente de summary()
   * (um retrato agregado no instante atual), aqui é possível acompanhar a
   * evolução no tempo: realizado por dia (data de liquidação/movimentação,
   * conforme §29) e comprometido por dia (data de vencimento das parcelas
   * ainda em aberto), mais uma lista das movimentações individuais que
   * compõem o realizado, para permitir o detalhamento ("drill-down").
   */
  async timeseries(from: Date, to: Date): Promise<CashFlowTimeseries> {
    const [payments, receipts, otherMatches, openPayables, openReceivables] = await Promise.all([
      this.prisma.client.payment.findMany({
        where: { status: { in: ["CONFIRMED", "RECONCILED"] }, paymentDate: { gte: from, lte: to } },
        select: {
          paymentDate: true,
          amount: true,
          allocations: {
            take: 1,
            select: { payableInstallment: { select: { payable: { select: { description: true } } } } },
          },
        },
      }),
      this.prisma.client.receipt.findMany({
        where: { status: { in: ["CONFIRMED", "RECONCILED"] }, receiptDate: { gte: from, lte: to } },
        select: {
          receiptDate: true,
          amount: true,
          allocations: {
            take: 1,
            select: { receivableInstallment: { select: { receivable: { select: { description: true } } } } },
          },
        },
      }),
      this.prisma.client.reconciliationMatch.findMany({
        where: {
          status: "ACTIVE",
          targetType: { in: ["BANK_FEE", "FINANCIAL_INCOME", "ADVANCE", "OTHER"] },
          bankTransaction: { transactionDate: { gte: from, lte: to } },
        },
        select: {
          targetType: true,
          matchedAmount: true,
          bankTransaction: { select: { transactionDate: true, direction: true, description: true, counterpartyName: true } },
        },
      }),
      this.prisma.client.payableInstallment.findMany({
        where: {
          status: { in: ["OPEN", "PARTIALLY_SETTLED"] },
          payable: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] } },
          dueDate: { gte: from, lte: to },
        },
        select: { dueDate: true, openAmount: true },
      }),
      this.prisma.client.receivableInstallment.findMany({
        where: {
          status: { in: ["OPEN", "PARTIALLY_SETTLED"] },
          receivable: { status: { in: ["OPEN", "PARTIALLY_SETTLED"] } },
          dueDate: { gte: from, lte: to },
        },
        select: { dueDate: true, openAmount: true },
      }),
    ]);

    const days = new Map<string, CashFlowDailyPoint>();
    for (let cursor = new Date(from); cursor.getTime() <= to.getTime(); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const key = toDateKey(cursor);
      days.set(key, {
        date: key,
        realizedInflow: "0.0000",
        realizedOutflow: "0.0000",
        realizedNet: "0.0000",
        cumulativeRealizedNet: "0.0000",
        committedInflow: "0.0000",
        committedOutflow: "0.0000",
      });
    }

    const addTo = (key: keyof CashFlowDailyPoint, date: Date, amount: number) => {
      const point = days.get(toDateKey(date));
      if (!point) return; // fora do intervalo solicitado — não deveria ocorrer dado o filtro da query
      point[key] = (Number(point[key]) + amount).toFixed(4);
    };

    const transactions: CashFlowTransactionRow[] = [];

    for (const p of payments) {
      const amount = Number(p.amount);
      addTo("realizedOutflow", p.paymentDate, amount);
      transactions.push({
        date: toDateKey(p.paymentDate),
        kind: "PAYMENT",
        direction: "OUTFLOW",
        amount: amount.toFixed(4),
        description: p.allocations[0]?.payableInstallment.payable.description ?? "Pagamento",
      });
    }
    for (const r of receipts) {
      const amount = Number(r.amount);
      addTo("realizedInflow", r.receiptDate, amount);
      transactions.push({
        date: toDateKey(r.receiptDate),
        kind: "RECEIPT",
        direction: "INFLOW",
        amount: amount.toFixed(4),
        description: r.allocations[0]?.receivableInstallment.receivable.description ?? "Recebimento",
      });
    }
    for (const m of otherMatches) {
      const amount = Number(m.matchedAmount);
      const inflow = m.bankTransaction.direction === "CREDIT";
      addTo(inflow ? "realizedInflow" : "realizedOutflow", m.bankTransaction.transactionDate, amount);
      transactions.push({
        date: toDateKey(m.bankTransaction.transactionDate),
        kind: m.targetType as CashFlowTransactionKind,
        direction: inflow ? "INFLOW" : "OUTFLOW",
        amount: amount.toFixed(4),
        description: m.bankTransaction.description ?? m.bankTransaction.counterpartyName ?? "Movimentação bancária",
      });
    }
    for (const i of openPayables) {
      addTo("committedOutflow", i.dueDate, Number(i.openAmount));
    }
    for (const i of openReceivables) {
      addTo("committedInflow", i.dueDate, Number(i.openAmount));
    }

    const daily = Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
    let cumulative = 0;
    for (const point of daily) {
      const net = Number(point.realizedInflow) - Number(point.realizedOutflow);
      point.realizedNet = net.toFixed(4);
      cumulative += net;
      point.cumulativeRealizedNet = cumulative.toFixed(4);
    }

    transactions.sort((a, b) => b.date.localeCompare(a.date));

    return { from: toDateKey(from), to: toDateKey(to), daily, transactions };
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
