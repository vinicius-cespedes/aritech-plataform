import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createTransferSchema, CreateTransferInput } from "@aritech/validation";
import { TransfersService } from "./transfers.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-transfers")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("transfers")
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @RequirePermissions("financial.account.read")
  @Get()
  list() {
    return this.service.list();
  }

  @RequirePermissions("financial.account.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.transfer.create")
  @Post()
  create(@Body(new ZodValidationPipe(createTransferSchema)) body: CreateTransferInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }
}
