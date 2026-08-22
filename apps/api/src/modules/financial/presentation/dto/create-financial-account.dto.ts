import { Currency, FinancialAccountType } from '@aritech/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateFinancialAccountDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  legalEntityId!: string;

  @ApiProperty({ example: 'Santander - Conta Corrente' })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ enum: FinancialAccountType })
  @IsEnum(FinancialAccountType)
  type!: FinancialAccountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  institutionName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bankCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  branch?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  accountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  accountDigit?: string;

  @ApiProperty({ enum: Currency, default: Currency.BRL })
  @IsEnum(Currency)
  currency: Currency = Currency.BRL;

  @ApiProperty({ example: '0.0000', description: 'Decimal enviado como string para preservar precisão.' })
  @IsString()
  @Matches(/^-?\d+(\.\d{1,4})?$/)
  openingBalance!: string;

  @ApiProperty({ example: '2026-08-14' })
  @IsDateString()
  openingBalanceDate!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowsReconciliation?: boolean;
}
