import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentTermsService } from '../application/payment-terms.service';
import { CreatePaymentTermDto } from './dto/create-payment-term.dto';

@ApiTags('payment-terms')
@Controller('financial/payment-terms')
export class PaymentTermsController {
  constructor(private readonly service: PaymentTermsService) {}
  @Get() list() { return this.service.list(); }
  @Post() @ApiOperation({ summary: 'Cria condição de pagamento e regras de parcelamento' }) create(@Body() input: CreatePaymentTermDto) { return this.service.create(input); }
}
