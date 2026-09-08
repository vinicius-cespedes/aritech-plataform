import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { closePeriodSchema, ClosePeriodInput, reopenPeriodSchema, ReopenPeriodInput } from "@aritech/validation";
import { PeriodsService } from "./periods.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-periods")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("financial-periods")
export class PeriodsController {
  constructor(private readonly service: PeriodsService) {}

  @RequirePermissions("financial.report.read")
  @Get()
  list() {
    return this.service.list();
  }

  @RequirePermissions("financial.report.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.report.read")
  @Post(":id/validate")
  validate(@Param("id") id: string) {
    return this.service.validate(id);
  }

  @RequirePermissions("financial.period.close")
  @Post(":id/close")
  close(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(closePeriodSchema)) body: ClosePeriodInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.close(id, body.acceptWarnings, user.id);
  }

  @RequirePermissions("financial.period.reopen")
  @Post(":id/reopen")
  reopen(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reopenPeriodSchema)) body: ReopenPeriodInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.reopen(id, body.reason, user.id);
  }
}
