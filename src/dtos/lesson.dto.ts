import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Math Lesson' })
  @IsString()
  name: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: '2024-12-30T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-12-30T11:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class UpdateLessonDto {
  @ApiProperty({ example: 'Updated Lesson Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '2024-12-30T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ example: '2024-12-30T11:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ example: 'Physics', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'confirmed', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class CancelLessonDto {
  @ApiProperty({ example: 'Student cancelled' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 60000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
