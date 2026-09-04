import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Matches, MaxLength, Min, ValidateNested } from 'class-validator';

class PaymentTermRuleDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) sequence!: number;
  @ApiProperty({ example: 30 }) @IsInt() @Min(0) daysAfterBase!: number;
  @ApiProperty({ example: '50.000000' }) @IsString() @Matches(/^\d+(\.\d{1,6})?$/) percentage!: string;
}

export class CreatePaymentTermDto {
  @ApiProperty() @IsString() @MaxLength(40) code!: string;
  @ApiProperty() @IsString() @MaxLength(160) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ type: [PaymentTermRuleDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentTermRuleDto) rules!: PaymentTermRuleDto[];
}
