import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from '../application/payments.service';
import { CreatePaymentDto, ReversePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@Controller('financial/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista pagamentos de uma entidade legal' })
  @ApiQuery({ name: 'legalEntityId', format: 'uuid' })
  list(@Query('legalEntityId') legalEntityId: string) {
    return this.service.list(legalEntityId);
  }

  @Post()
  @ApiOperation({ summary: 'Registra pagamento total, parcial ou antecipado' })
  create(@Body() input: CreatePaymentDto) {
    return this.service.create(input);
  }

  @Post(':paymentId/reverse')
  @ApiOperation({ summary: 'Estorna um pagamento preservando o histórico' })
  reverse(@Param('paymentId') paymentId: string, @Body() input: ReversePaymentDto) {
    return this.service.reverse(paymentId, input);
  }
}
