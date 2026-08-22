import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ImportOfxDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  financialAccountId!: string;

  @ApiProperty({ example: 'extrato-2026-08.ofx' })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({ description: 'Conteúdo textual do arquivo OFX.' })
  @IsString()
  content!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  createdBy!: string;
}

export class StartBankReconciliationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  financialAccountId!: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  statementPeriodStart!: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  statementPeriodEnd!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  startedBy!: string;
}

export class ConfirmPaymentMatchDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  bankTransactionId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  paymentId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  matchedBy!: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
