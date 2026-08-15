import { Module } from '@nestjs/common';
import { FinancialAccountsController } from './presentation/financial-accounts.controller';
import { FinancialAccountsService } from './application/financial-accounts.service';

@Module({
  controllers: [FinancialAccountsController],
  providers: [FinancialAccountsService],
})
export class FinancialModule {}
