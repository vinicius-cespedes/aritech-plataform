import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from '../application/suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@ApiTags('suppliers')
@Controller('financial/suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @ApiQuery({ name: 'legalEntityId', format: 'uuid' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por razão social, nome fantasia ou CPF/CNPJ' })
  list(@Query('legalEntityId') legalEntityId: string, @Query('search') search?: string) {
    return this.service.list(legalEntityId, search);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra fornecedor com contas bancárias e chaves PIX' })
  create(@Body() input: CreateSupplierDto) { return this.service.create(input); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: CreateSupplierDto) {
    return this.service.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('legalEntityId') legalEntityId: string) {
    return this.service.remove(id, legalEntityId);
  }
}
