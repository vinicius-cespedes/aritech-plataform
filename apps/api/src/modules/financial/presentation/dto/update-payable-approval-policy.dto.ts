import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class UpdatePayableApprovalPolicyDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() legalEntityId!: string;
  @ApiProperty({ example: '0.0000' }) @IsString() @Matches(/^\d+(\.\d{1,4})?$/) approvalRequiredFrom!: string;
  @ApiProperty({ format: 'uuid', description: 'Temporário até autenticação fornecer o usuário da sessão.' }) @IsUUID() updatedBy!: string;
}
