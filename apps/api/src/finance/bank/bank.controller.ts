import { BadRequestException, Body, Controller, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import {
  createReconciliationMatchesSchema,
  CreateReconciliationMatchesInput,
  reverseReconciliationMatchSchema,
  ReverseReconciliationMatchInput,
  classifyBankTransactionSchema,
  ClassifyBankTransactionInput,
} from "@aritech/validation";
import { BankStatementsService } from "./bank-statements.service";
import { ReconciliationService } from "./reconciliation.service";
import { BankClassificationService } from "./bank-classification.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@ApiTags("finance-bank")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class BankController {
  constructor(
    private readonly statements: BankStatementsService,
    private readonly reconciliation: ReconciliationService,
    private readonly classification: BankClassificationService,
  ) {}

  @RequirePermissions("financial.bank.read")
  @Get("bank-statement-imports")
  listImports(@Query("financialAccountId") financialAccountId?: string) {
    return this.statements.list(financialAccountId);
  }

  @RequirePermissions("financial.bank.read")
  @Get("bank-statement-imports/:id")
  getImport(@Param("id") id: string) {
    return this.statements.get(id);
  }

  @RequirePermissions("financial.bank.import")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  @Post("bank-statement-imports")
  async importOfx(
    @Body("financialAccountId") financialAccountId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "Arquivo OFX não enviado (campo 'file')." });
    }
    if (!financialAccountId) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "financialAccountId é obrigatório." });
    }
    return this.statements.importOfx(financialAccountId, file.originalname, file.buffer, user.id);
  }

  @RequirePermissions("financial.bank.read")
  @Get("bank-transactions")
  listTransactions(
    @Query("financialAccountId") financialAccountId?: string,
    @Query("reconciliationStatus") reconciliationStatus?: string,
  ) {
    return this.reconciliation.listTransactions(financialAccountId, reconciliationStatus);
  }

  @RequirePermissions("financial.bank.read")
  @Get("bank-transactions/:id")
  getTransaction(@Param("id") id: string) {
    return this.reconciliation.getTransaction(id);
  }

  @RequirePermissions("financial.bank.read")
  @Get("bank-transactions/:id/suggestions")
  suggest(@Param("id") id: string) {
    return this.reconciliation.suggestMatches(id);
  }

  @RequirePermissions("financial.reconciliation.manage")
  @Post("bank-transactions/:id/matches")
  createMatches(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(createReconciliationMatchesSchema)) body: CreateReconciliationMatchesInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reconciliation.createMatches(id, body, user.id);
  }

  @RequirePermissions("financial.reconciliation.manage")
  @Post("bank-transactions/:id/classify")
  classify(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(classifyBankTransactionSchema)) body: ClassifyBankTransactionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classification.classify(id, body, user.id);
  }

  @RequirePermissions("financial.reconciliation.reverse")
  @Post("reconciliation-matches/:matchId/reverse")
  reverseMatch(
    @Param("matchId") matchId: string,
    @Body(new ZodValidationPipe(reverseReconciliationMatchSchema)) body: ReverseReconciliationMatchInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reconciliation.reverseMatch(matchId, body.reason, user.id);
  }
}
