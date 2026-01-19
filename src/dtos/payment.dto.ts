import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  lessonIds: string[];

  @ApiProperty({ example: 'Monthly payment', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelPaymentDto {
  @ApiProperty({ example: 'Incorrect amount' })
  @IsString()
  reason: string;
}
