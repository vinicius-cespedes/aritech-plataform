import { Module } from "@nestjs/common";
import { ReceiptsController } from "./receipts.controller";
import { ReceiptsService } from "./receipts.service";
import { PeriodsModule } from "../periods/periods.module";

@Module({
  imports: [PeriodsModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
