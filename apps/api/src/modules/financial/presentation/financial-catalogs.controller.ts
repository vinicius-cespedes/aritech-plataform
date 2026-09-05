import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FinancialCatalogsService } from '../application/financial-catalogs.service';

@ApiTags('financial-catalogs')
@Controller('financial/catalogs')
export class FinancialCatalogsController {
  constructor(private readonly service: FinancialCatalogsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista catálogos financeiros para seletores da interface' })
  @ApiQuery({ name: 'legalEntityId', format: 'uuid' })
  list(@Query('legalEntityId') legalEntityId: string) {
    return this.service.getCatalogs(legalEntityId);
  }
}
