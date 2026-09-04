import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PayablesService } from '../application/payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';

@ApiTags('payables')
@Controller('financial/payables')
export class PayablesController {
  constructor(private readonly service: PayablesService) {}
  @Get() @ApiQuery({ name: 'legalEntityId', format: 'uuid' }) list(@Query('legalEntityId') legalEntityId: string) { return this.service.list(legalEntityId); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() @ApiOperation({ summary: 'Cria conta a pagar com parcelas, rateio gerencial e anexos' }) create(@Body() input: CreatePayableDto) { return this.service.create(input); }
}
