import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CostBehavior, CostDirectness, CounterpartyType, Currency, DocumentType, EconomicNature, PayableSourceType, PaymentMethod } from '@aritech/database';
import { IsArray, IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID, Matches, MinLength, ValidateNested } from 'class-validator';

export const PAYABLE_OBLIGATION_TYPES = [
  'SUPPLIER_PAYMENT','RENT','TAX','SALARY','SALARY_ADVANCE','VACATION','THIRTEENTH_SALARY',
  'REIMBURSEMENT','BENEFIT','TERMINATION','PRO_LABORE','OTHER',
] as const;

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
  @ApiPropertyOptional({ enum: EconomicNature, description: 'Quando omitido, herda da conta gerencial.' }) @IsOptional() @IsEnum(EconomicNature) economicNature?: EconomicNature;
  @ApiPropertyOptional({ enum: CostBehavior, description: 'Quando omitido, herda da conta gerencial.' }) @IsOptional() @IsEnum(CostBehavior) costBehavior?: CostBehavior;
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
  @ApiProperty({ enum: CounterpartyType }) @IsEnum(CounterpartyType) counterpartyType!: CounterpartyType;
  @ApiProperty({ format: 'uuid' }) @IsUUID() counterpartyId!: string;
  @ApiProperty({ enum: PAYABLE_OBLIGATION_TYPES }) @IsIn(PAYABLE_OBLIGATION_TYPES) obligationType!: typeof PAYABLE_OBLIGATION_TYPES[number];
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
  @ApiPropertyOptional() @IsOptional() @IsDateString() paymentTermBaseDate?: string;
  @ApiPropertyOptional({ type: [PayableInstallmentInputDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PayableInstallmentInputDto) installments?: PayableInstallmentInputDto[];
  @ApiProperty({ type: [FinancialAllocationInputDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => FinancialAllocationInputDto) allocations!: FinancialAllocationInputDto[];
  @ApiPropertyOptional({ type: [PayableDocumentInputDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PayableDocumentInputDto) documents?: PayableDocumentInputDto[];
  @ApiProperty({ format: 'uuid' }) @IsUUID() createdBy!: string;
}
