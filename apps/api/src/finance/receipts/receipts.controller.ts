import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createReceiptSchema, CreateReceiptInput, reverseReceiptSchema, ReverseReceiptInput } from "@aritech/validation";
import { ReceiptsService } from "./receipts.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-receipts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("receipts")
export class ReceiptsController {
  constructor(private readonly service: ReceiptsService) {}

  @RequirePermissions("financial.receivable.read")
  @Get()
  list() {
    return this.service.list();
  }

  @RequirePermissions("financial.receivable.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.receipt.create")
  @Post()
  create(@Body(new ZodValidationPipe(createReceiptSchema)) body: CreateReceiptInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("financial.receipt.reverse")
  @Post(":id/reverse")
  reverse(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reverseReceiptSchema)) body: ReverseReceiptInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.reverse(id, body.reason, user.id);
  }
}
