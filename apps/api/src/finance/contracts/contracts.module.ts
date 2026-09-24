import { Module } from "@nestjs/common";
import { ContractsController } from "./contracts.controller";
import { ContractsService } from "./contracts.service";
import { AllocationService } from "./allocation.service";

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, AllocationService],
  exports: [ContractsService, AllocationService],
})
export class ContractsModule {}
