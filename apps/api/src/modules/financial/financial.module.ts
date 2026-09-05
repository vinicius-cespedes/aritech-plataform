import { Module } from '@nestjs/common';
import { FinancialAccountsController } from './presentation/financial-accounts.controller';
import { FinancialAccountsService } from './application/financial-accounts.service';
import { FinancialCatalogsController } from './presentation/financial-catalogs.controller';
import { FinancialCatalogsService } from './application/financial-catalogs.service';
import { SuppliersController } from './presentation/suppliers.controller';
import { SuppliersService } from './application/suppliers.service';
import { EmployeesController } from './presentation/employees.controller';
import { EmployeesService } from './application/employees.service';
import { PaymentTermsController } from './presentation/payment-terms.controller';
import { PaymentTermsService } from './application/payment-terms.service';
import { PayablesController } from './presentation/payables.controller';
import { PayablesService } from './application/payables.service';
import { PayableApprovalPolicyController } from './presentation/payable-approval-policy.controller';
import { PayableApprovalPolicyService } from './application/payable-approval-policy.service';
import { PayableApprovalsController } from './presentation/payable-approvals.controller';
import { PayableApprovalsService } from './application/payable-approvals.service';
import { PaymentsController } from './presentation/payments.controller';
import { PaymentsService } from './application/payments.service';
import { BankReconciliationController } from './presentation/bank-reconciliation.controller';
import { BankReconciliationService } from './application/bank-reconciliation.service';

@Module({
  controllers: [FinancialAccountsController, FinancialCatalogsController, SuppliersController, EmployeesController, PaymentTermsController, PayablesController, PayableApprovalPolicyController, PayableApprovalsController, PaymentsController, BankReconciliationController],
  providers: [FinancialAccountsService, FinancialCatalogsService, SuppliersService, EmployeesService, PaymentTermsService, PayablesService, PayableApprovalPolicyService, PayableApprovalsService, PaymentsService, BankReconciliationService],
})
export class FinancialModule {}
