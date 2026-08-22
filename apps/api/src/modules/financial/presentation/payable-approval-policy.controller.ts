import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PayableApprovalPolicyService } from '../application/payable-approval-policy.service';
import { UpdatePayableApprovalPolicyDto } from './dto/update-payable-approval-policy.dto';

@ApiTags('payable-approval-policy')
@Controller('financial/payable-approval-policy')
export class PayableApprovalPolicyController {
  constructor(private readonly service: PayableApprovalPolicyService) {}
  @Get() @ApiQuery({ name: 'legalEntityId', format: 'uuid' }) get(@Query('legalEntityId') id: string) { return this.service.get(id); }
  @Put() @ApiOperation({ summary: 'Define valor a partir do qual contas exigem aprovação' }) set(@Body() input: UpdatePayableApprovalPolicyDto) { return this.service.set(input); }
}
