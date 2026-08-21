import { Module } from '@nestjs/common';
import { FinancialAccountsController } from './presentation/financial-accounts.controller';
import { FinancialAccountsService } from './application/financial-accounts.service';
import { SuppliersController } from './presentation/suppliers.controller';
import { SuppliersService } from './application/suppliers.service';
import { PaymentTermsController } from './presentation/payment-terms.controller';
import { PaymentTermsService } from './application/payment-terms.service';
import { PayablesController } from './presentation/payables.controller';
import { PayablesService } from './application/payables.service';
import { PayableApprovalPolicyController } from './presentation/payable-approval-policy.controller';
import { PayableApprovalPolicyService } from './application/payable-approval-policy.service';

@Module({
  controllers: [
    FinancialAccountsController,
    SuppliersController,
    PaymentTermsController,
    PayablesController,
    PayableApprovalPolicyController,
  ],
  providers: [
    FinancialAccountsService,
    SuppliersService,
    PaymentTermsService,
    PayablesService,
    PayableApprovalPolicyService,
  ],
})
export class FinancialModule {}
