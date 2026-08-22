import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from '../application/suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@ApiTags('suppliers')
@Controller('financial/suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @ApiQuery({ name: 'legalEntityId', format: 'uuid' })
  list(@Query('legalEntityId') legalEntityId: string) { return this.service.list(legalEntityId); }

  @Post()
  @ApiOperation({ summary: 'Cadastra fornecedor com contas bancárias e chaves PIX' })
  create(@Body() input: CreateSupplierDto) { return this.service.create(input); }
}
