import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createEmployeeSchema, CreateEmployeeInput, updateEmployeeSchema } from "@aritech/validation";
import { EmployeesService } from "./employees.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@ApiTags("organization")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("employees")
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @RequirePermissions("financial.payable.read")
  @Get()
  list(@Query("includeInactive") includeInactive?: string) {
    return this.service.list(includeInactive === "true");
  }

  @RequirePermissions("financial.payable.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("organization.employee.manage")
  @Post()
  create(@Body(new ZodValidationPipe(createEmployeeSchema)) body: CreateEmployeeInput, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("organization.employee.manage")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) body: Partial<CreateEmployeeInput>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, body, user.id);
  }

  @RequirePermissions("organization.employee.manage")
  @Post(":id/deactivate")
  deactivate(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deactivate(id, user.id);
  }
}
