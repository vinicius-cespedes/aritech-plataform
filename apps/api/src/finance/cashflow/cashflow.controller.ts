import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CashFlowService } from "./cashflow.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";

@ApiTags("finance-cashflow")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("cashflow")
export class CashFlowController {
  constructor(private readonly service: CashFlowService) {}

  @RequirePermissions("financial.report.read")
  @Get("summary")
  summary() {
    return this.service.summary();
  }

  @RequirePermissions("financial.report.read")
  @Get("aging")
  aging() {
    return this.service.aging();
  }
}
