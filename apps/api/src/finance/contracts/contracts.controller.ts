import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createContractSchema,
  CreateContractInput,
  updateContractSchema,
  UpdateContractInput,
} from "@aritech/validation";
import { ContractsService } from "./contracts.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-contracts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("contracts")
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @RequirePermissions("financial.contract.read")
  @Get()
  list() {
    return this.service.list();
  }

  @RequirePermissions("financial.contract.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @RequirePermissions("financial.contract.manage")
  @Post()
  create(
    @Body(new ZodValidationPipe(createContractSchema)) body: CreateContractInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(body, user.id);
  }

  @RequirePermissions("financial.contract.manage")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateContractSchema)) body: UpdateContractInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, body, user.id);
  }
}
