import { Module } from "@nestjs/common";
import { ReceivablesController } from "./receivables.controller";
import { ReceivablesService } from "./receivables.service";
import { PeriodsModule } from "../periods/periods.module";
import { ContractsModule } from "../contracts/contracts.module";

@Module({
  imports: [PeriodsModule, ContractsModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
