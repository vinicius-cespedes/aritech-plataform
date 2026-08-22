import { Currency, PaymentMethod } from '@aritech/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateNested } from 'class-validator';

const decimalPattern = /^\d+(\.\d{1,4})?$/;

export class CreatePaymentAllocationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  payableInstallmentId!: string;

  @ApiProperty({ example: '1000.0000' })
  @IsString()
  @Matches(decimalPattern)
  principalAmount!: string;

  @ApiPropertyOptional({ example: '0.0000' })
  @IsOptional()
  @IsString()
  @Matches(decimalPattern)
  interestAmount?: string;

  @ApiPropertyOptional({ example: '0.0000' })
  @IsOptional()
  @IsString()
  @Matches(decimalPattern)
  penaltyAmount?: string;

  @ApiPropertyOptional({ example: '0.0000' })
  @IsOptional()
  @IsString()
  @Matches(decimalPattern)
  discountAmount?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  legalEntityId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  financialAccountId!: string;

  @ApiProperty({ example: '2026-08-22' })
  @IsDateString()
  paymentDate!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ enum: Currency, default: Currency.BRL })
  @IsEnum(Currency)
  currency: Currency = Currency.BRL;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  createdBy!: string;

  @ApiProperty({ type: [CreatePaymentAllocationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentAllocationDto)
  allocations!: CreatePaymentAllocationDto[];
}

export class ReversePaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  actorId!: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  reason!: string;
}
