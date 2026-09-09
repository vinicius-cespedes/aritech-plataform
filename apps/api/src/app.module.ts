import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizationModule } from "./organization/organization.module";
import { DocumentsModule } from "./documents/documents.module";
import { AccountsModule } from "./finance/accounts/accounts.module";
import { PayablesModule } from "./finance/payables/payables.module";
import { PaymentsModule } from "./finance/payments/payments.module";
import { ReceivablesModule } from "./finance/receivables/receivables.module";
import { ReceiptsModule } from "./finance/receipts/receipts.module";
import { BankModule } from "./finance/bank/bank.module";
import { TransfersModule } from "./finance/transfers/transfers.module";
import { PeriodsModule } from "./finance/periods/periods.module";
import { CashFlowModule } from "./finance/cashflow/cashflow.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ADR-004 §29 — proteção básica contra força bruta (limitação de tentativas).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuditModule,
    AuthModule,
    OrganizationModule,
    DocumentsModule,
    AccountsModule,
    PeriodsModule,
    PayablesModule,
    PaymentsModule,
    ReceivablesModule,
    ReceiptsModule,
    BankModule,
    TransfersModule,
    CashFlowModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
