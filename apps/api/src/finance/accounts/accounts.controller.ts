import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createCostCenterSchema,
  CreateCostCenterInput,
  createFinancialAccountSchema,
  CreateFinancialAccountInput,
  createManagementAccountSchema,
  CreateManagementAccountInput,
  createResultCenterSchema,
  CreateResultCenterInput,
} from "@aritech/validation";
import { AccountsService } from "./accounts.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-accounts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @RequirePermissions("financial.account.read")
  @Get("financial-accounts")
  listFinancialAccounts() {
    return this.service.listFinancialAccounts();
  }

  @RequirePermissions("financial.account.manage")
  @Post("financial-accounts")
  createFinancialAccount(
    @Body(new ZodValidationPipe(createFinancialAccountSchema)) body: CreateFinancialAccountInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createFinancialAccount(body, user.id);
  }

  @RequirePermissions("financial.account.read")
  @Get("management-accounts")
  listManagementAccounts() {
    return this.service.listManagementAccounts();
  }

  @RequirePermissions("financial.account.manage")
  @Post("management-accounts")
  createManagementAccount(
    @Body(new ZodValidationPipe(createManagementAccountSchema)) body: CreateManagementAccountInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createManagementAccount(body, user.id);
  }

  @RequirePermissions("financial.account.read")
  @Get("cost-centers")
  listCostCenters() {
    return this.service.listCostCenters();
  }

  @RequirePermissions("financial.account.manage")
  @Post("cost-centers")
  createCostCenter(
    @Body(new ZodValidationPipe(createCostCenterSchema)) body: CreateCostCenterInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createCostCenter(body, user.id);
  }

  @RequirePermissions("financial.account.read")
  @Get("result-centers")
  listResultCenters() {
    return this.service.listResultCenters();
  }

  @RequirePermissions("financial.account.manage")
  @Post("result-centers")
  createResultCenter(
    @Body(new ZodValidationPipe(createResultCenterSchema)) body: CreateResultCenterInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createResultCenter(body, user.id);
  }
}
