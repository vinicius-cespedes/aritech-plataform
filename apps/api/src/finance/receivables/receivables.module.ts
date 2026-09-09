import { Module } from "@nestjs/common";
import { ReceivablesController } from "./receivables.controller";
import { ReceivablesService } from "./receivables.service";
import { PeriodsModule } from "../periods/periods.module";

@Module({
  imports: [PeriodsModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
