import { Module } from "@nestjs/common";
import { BankController } from "./bank.controller";
import { BankStatementsService } from "./bank-statements.service";
import { ReconciliationService } from "./reconciliation.service";
import { PeriodsModule } from "../periods/periods.module";

@Module({
  imports: [PeriodsModule],
  controllers: [BankController],
  providers: [BankStatementsService, ReconciliationService],
  exports: [BankStatementsService, ReconciliationService],
})
export class BankModule {}
