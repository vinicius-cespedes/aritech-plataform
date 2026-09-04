import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { SUPPLIER_INDUSTRIES } from '../../domain/supplier-industries';

class SupplierBankAccountDto {
  @ApiProperty() @IsString() @MaxLength(160) bankName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) bankCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) branch?: string;
  @ApiProperty() @IsString() @MaxLength(60) accountNumber!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10) accountDigit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() holderName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() holderDocument?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isDefault?: boolean;
}

class SupplierPixKeyDto {
  @ApiProperty({ example: 'CNPJ' }) @IsString() keyType!: string;
  @ApiProperty() @IsString() @MaxLength(255) keyValue!: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class CreateSupplierDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() legalEntityId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) legalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) tradeName?: string;
  @ApiPropertyOptional({ description: 'CPF ou CNPJ. Opcional; quando informado deve ser válido.' }) @IsOptional() @IsString() @MaxLength(20) taxDocument?: string;
  @ApiPropertyOptional({ enum: SUPPLIER_INDUSTRIES }) @IsOptional() @IsIn(SUPPLIER_INDUSTRIES) industry?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() contactEmail?: string;
  @ApiPropertyOptional({ example: '+55' }) @IsOptional() @IsString() @MaxLength(8) contactPhoneCountryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPhone?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() defaultPaymentTermId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: [SupplierBankAccountDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SupplierBankAccountDto) bankAccounts?: SupplierBankAccountDto[];
  @ApiPropertyOptional({ type: [SupplierPixKeyDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SupplierPixKeyDto) pixKeys?: SupplierPixKeyDto[];
}
