import { Module } from "@nestjs/common";
import { PayablesController } from "./payables.controller";
import { PayablesService } from "./payables.service";
import { PeriodsModule } from "../periods/periods.module";

@Module({
  imports: [PeriodsModule],
  controllers: [PayablesController],
  providers: [PayablesService],
  exports: [PayablesService],
})
export class PayablesModule {}
