import { Module } from '@nestjs/common';
import { FinancialModule } from './modules/financial/financial.module';
import { HealthController } from './health.controller';

@Module({
  imports: [FinancialModule],
  controllers: [HealthController],
})
export class AppModule {}
