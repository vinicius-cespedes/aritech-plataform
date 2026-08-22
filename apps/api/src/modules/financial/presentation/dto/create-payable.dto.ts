import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CostBehavior, CostDirectness, Currency, DocumentType, EconomicNature, PayableSourceType, PaymentMethod } from '@aritech/database';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Matches, MinLength, ValidateNested } from 'class-validator';

class PayableInstallmentInputDto {
  @ApiProperty() @IsDateString() dueDate!: string;
  @ApiProperty({ example: '1000.0000' }) @IsString() @Matches(/^\d+(\.\d{1,4})?$/) amount!: string;
  @ApiPropertyOptional({ enum: PaymentMethod }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
}

class FinancialAllocationInputDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() managementAccountId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() costCenterId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() businessLineId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() projectId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() contractId?: string;
  @ApiProperty({ example: '1000.0000' }) @IsString() @Matches(/^\d+(\.\d{1,4})?$/) amount!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() competenceDate?: string;
  @ApiProperty({ enum: EconomicNature }) @IsEnum(EconomicNature) economicNature!: EconomicNature;
  @ApiProperty({ enum: CostBehavior }) @IsEnum(CostBehavior) costBehavior!: CostBehavior;
  @ApiProperty({ enum: CostDirectness }) @IsEnum(CostDirectness) costDirectness!: CostDirectness;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() dreGroupId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() cashFlowGroupId?: string;
}

class PayableDocumentInputDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() documentId!: string;
  @ApiPropertyOptional({ enum: DocumentType }) @IsOptional() @IsEnum(DocumentType) type?: DocumentType;
  @ApiPropertyOptional() @IsOptional() @IsString() label?: string;
}

export class CreatePayableDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() legalEntityId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() supplierId!: string;
  @ApiProperty() @IsString() @MinLength(3) description!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documentNumber?: string;
  @ApiPropertyOptional({ enum: DocumentType }) @IsOptional() @IsEnum(DocumentType) documentType?: DocumentType;
  @ApiPropertyOptional() @IsOptional() @IsDateString() issueDate?: string;
  @ApiProperty() @IsDateString() competenceDate!: string;
  @ApiProperty({ example: '10000.0000' }) @IsString() @Matches(/^\d+(\.\d{1,4})?$/) originalAmount!: string;
  @ApiPropertyOptional({ enum: Currency, default: Currency.BRL }) @IsOptional() @IsEnum(Currency) currency?: Currency;
  @ApiProperty({ enum: PayableSourceType }) @IsEnum(PayableSourceType) sourceType!: PayableSourceType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() sourceId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() contractId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() purchaseOrderId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() paymentTermId?: string;
  @ApiPropertyOptional({ description: 'Base para geração automática das parcelas; normalmente emissão.' }) @IsOptional() @IsDateString() paymentTermBaseDate?: string;
  @ApiPropertyOptional({ type: [PayableInstallmentInputDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PayableInstallmentInputDto) installments?: PayableInstallmentInputDto[];
  @ApiProperty({ type: [FinancialAllocationInputDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => FinancialAllocationInputDto) allocations!: FinancialAllocationInputDto[];
  @ApiPropertyOptional({ type: [PayableDocumentInputDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PayableDocumentInputDto) documents?: PayableDocumentInputDto[];
  @ApiProperty({ format: 'uuid', description: 'Temporário até autenticação fornecer o usuário da sessão.' }) @IsUUID() createdBy!: string;
}
