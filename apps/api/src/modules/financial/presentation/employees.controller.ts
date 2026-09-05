import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmployeesService } from '../application/employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@ApiTags('employees')
@Controller('financial/employees')
export class EmployeesController {
  constructor(private readonly service:EmployeesService) {}

  @Get()
  @ApiQuery({ name:'legalEntityId', format:'uuid' })
  @ApiQuery({ name:'search', required:false })
  list(@Query('legalEntityId') legalEntityId:string, @Query('search') search?:string) {
    return this.service.list(legalEntityId, search);
  }

  @Post()
  @ApiOperation({ summary:'Cadastra colaborador para uso como contraparte financeira' })
  create(@Body() input:CreateEmployeeDto) { return this.service.create(input); }

  @Patch(':id')
  update(@Param('id') id:string, @Body() input:CreateEmployeeDto) {
    return this.service.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id') id:string, @Query('legalEntityId') legalEntityId:string) {
    return this.service.remove(id, legalEntityId);
  }
}
