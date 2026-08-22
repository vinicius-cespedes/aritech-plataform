import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FinancialAccountsService } from '../application/financial-accounts.service';
import { CreateFinancialAccountDto } from './dto/create-financial-account.dto';

@ApiTags('financial-accounts')
@Controller('financial/accounts')
export class FinancialAccountsController {
  constructor(private readonly service: FinancialAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista contas financeiras de uma entidade legal' })
  @ApiQuery({ name: 'legalEntityId', format: 'uuid' })
  list(@Query('legalEntityId') legalEntityId: string) {
    return this.service.list(legalEntityId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma conta financeira' })
  create(@Body() input: CreateFinancialAccountDto) {
    return this.service.create(input);
  }
}
