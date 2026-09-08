import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createPaymentSchema, CreatePaymentInput, reversePaymentSchema, ReversePaymentInput } from "@aritech/validation";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-payments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @RequirePermissions("financial.payable.read")
  @Get()
  list() {
    return this.service.list();
  }

  @RequirePermissions("financial.payable.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.payment.create")
  @Post()
  create(@Body(new ZodValidationPipe(createPaymentSchema)) body: CreatePaymentInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("financial.payment.reverse")
  @Post(":id/reverse")
  reverse(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reversePaymentSchema)) body: ReversePaymentInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.reverse(id, body.reason, user.id);
  }
}
