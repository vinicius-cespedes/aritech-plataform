import { Module } from "@nestjs/common";
import { TransfersController } from "./transfers.controller";
import { TransfersService } from "./transfers.service";
import { PeriodsModule } from "../periods/periods.module";

@Module({
  imports: [PeriodsModule],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
