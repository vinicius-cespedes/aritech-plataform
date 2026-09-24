import { Module } from "@nestjs/common";
import { PayablesController } from "./payables.controller";
import { PayablesService } from "./payables.service";
import { PeriodsModule } from "../periods/periods.module";
import { ContractsModule } from "../contracts/contracts.module";

@Module({
  imports: [PeriodsModule, ContractsModule],
  controllers: [PayablesController],
  providers: [PayablesService],
  exports: [PayablesService],
})
export class PayablesModule {}
