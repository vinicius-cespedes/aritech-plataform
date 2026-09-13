import { Module } from "@nestjs/common";
import { BankController } from "./bank.controller";
import { BankStatementsService } from "./bank-statements.service";
import { ReconciliationService } from "./reconciliation.service";
import { BankClassificationService } from "./bank-classification.service";
import { PeriodsModule } from "../periods/periods.module";

@Module({
  imports: [PeriodsModule],
  controllers: [BankController],
  providers: [BankStatementsService, ReconciliationService, BankClassificationService],
  exports: [BankStatementsService, ReconciliationService, BankClassificationService],
})
export class BankModule {}
