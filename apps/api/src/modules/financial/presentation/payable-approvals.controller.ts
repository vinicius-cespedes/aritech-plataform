import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PayableApprovalsService } from '../application/payable-approvals.service';
import { PayableApprovalActionDto } from './dto/payable-approval-action.dto';

@ApiTags('payable-approvals')
@Controller('financial/payables/:payableId/approvals')
export class PayableApprovalsController {
  constructor(private readonly service: PayableApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista o histórico de aprovação da conta a pagar' })
  history(@Param('payableId') payableId: string) {
    return this.service.history(payableId);
  }

  @Post('approve')
  @ApiOperation({ summary: 'Aprova a versão atual da conta a pagar' })
  approve(@Param('payableId') payableId: string, @Body() input: PayableApprovalActionDto) {
    return this.service.approve(payableId, input);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Reprova a versão atual e devolve a conta para rascunho' })
  reject(@Param('payableId') payableId: string, @Body() input: PayableApprovalActionDto) {
    return this.service.reject(payableId, input);
  }
}
