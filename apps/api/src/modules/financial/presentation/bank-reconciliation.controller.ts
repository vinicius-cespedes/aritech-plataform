import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BankReconciliationService } from '../application/bank-reconciliation.service';
import {
  ConfirmPaymentMatchDto,
  ImportOfxDto,
  StartBankReconciliationDto,
} from './dto/bank-reconciliation.dto';

@ApiTags('bank-reconciliation')
@Controller('financial/bank-reconciliation')
export class BankReconciliationController {
  constructor(private readonly service: BankReconciliationService) {}

  @Post('ofx/import')
  @ApiOperation({ summary: 'Importa um extrato OFX e cria movimentações bancárias não conciliadas' })
  importOfx(@Body() input: ImportOfxDto) {
    return this.service.importOfx(input);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Inicia uma sessão de conciliação bancária' })
  start(@Body() input: StartBankReconciliationDto) {
    return this.service.start(input);
  }

  @Get('sessions/:reconciliationId/suggestions')
  @ApiOperation({ summary: 'Gera sugestões de conciliação sem confirmar automaticamente' })
  suggestions(@Param('reconciliationId') reconciliationId: string) {
    return this.service.suggestions(reconciliationId);
  }

  @Post('sessions/:reconciliationId/confirm-payment')
  @ApiOperation({ summary: 'Confirma humanamente o match entre movimentação bancária e pagamento' })
  confirmPayment(
    @Param('reconciliationId') reconciliationId: string,
    @Body() input: ConfirmPaymentMatchDto,
  ) {
    return this.service.confirmPaymentMatch(reconciliationId, input);
  }
}
