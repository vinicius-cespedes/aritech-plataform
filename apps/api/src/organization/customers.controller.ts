import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createCustomerSchema, CreateCustomerInput, updateCustomerSchema } from "@aritech/validation";
import { CustomersService } from "./customers.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@ApiTags("organization")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("customers")
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @RequirePermissions("financial.receivable.read")
  @Get()
  list(@Query("includeInactive") includeInactive?: string) {
    return this.service.list(includeInactive === "true");
  }

  @RequirePermissions("financial.receivable.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("organization.customer.manage")
  @Post()
  create(@Body(new ZodValidationPipe(createCustomerSchema)) body: CreateCustomerInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("organization.customer.manage")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCustomerSchema)) body: Partial<CreateCustomerInput>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, body, user.id);
  }

  @RequirePermissions("organization.customer.manage")
  @Post(":id/deactivate")
  deactivate(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deactivate(id, user.id);
  }
}
