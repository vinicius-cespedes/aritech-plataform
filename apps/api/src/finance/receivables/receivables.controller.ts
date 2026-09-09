import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createReceivableSchema, CreateReceivableInput } from "@aritech/validation";
import { ReceivablesService } from "./receivables.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-receivables")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("receivables")
export class ReceivablesController {
  constructor(private readonly service: ReceivablesService) {}

  @RequirePermissions("financial.receivable.read")
  @Get()
  list(@Query("status") status?: string) {
    return this.service.list(status);
  }

  @RequirePermissions("financial.receivable.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.receivable.create")
  @Post()
  create(@Body(new ZodValidationPipe(createReceivableSchema)) body: CreateReceivableInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("financial.receivable.create")
  @Post(":id/cancel")
  cancel(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.cancel(id, user.id);
  }
}
