import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createPayableSchema, CreatePayableInput, rejectPayableSchema, RejectPayableInput } from "@aritech/validation";
import { PayablesService } from "./payables.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-payables")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("payables")
export class PayablesController {
  constructor(private readonly service: PayablesService) {}

  @RequirePermissions("financial.payable.read")
  @Get()
  list(@Query("status") status?: string) {
    return this.service.list(status);
  }

  @RequirePermissions("financial.payable.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.payable.create")
  @Post()
  create(@Body(new ZodValidationPipe(createPayableSchema)) body: CreatePayableInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("financial.payable.approve")
  @Post(":id/approve")
  approve(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approve(id, user.id);
  }

  @RequirePermissions("financial.payable.approve")
  @Post(":id/reject")
  reject(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(rejectPayableSchema)) body: RejectPayableInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.reject(id, body.reason, user.id);
  }

  @RequirePermissions("financial.payable.cancel")
  @Post(":id/cancel")
  cancel(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.cancel(id, user.id);
  }
}
