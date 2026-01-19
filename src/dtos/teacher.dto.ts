import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 belgidan iborat bolishi kerak' })
  password: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  specification?: string;

  @ApiProperty({ example: 'Advanced', required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 'Experienced math teacher', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourPrice?: number;

  @ApiProperty({ example: 'https://portfolio.com', required: false })
  @IsOptional()
  @IsString()
  portfolioLink?: string;

  @ApiProperty({ example: '5 years', required: false })
  @IsOptional()
  @IsString()
  experience?: string;
}

export class UpdateTeacherDto {
  @ApiProperty({ example: 'John Doe Updated', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  specification?: string;

  @ApiProperty({ example: 'Expert', required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 60000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourPrice?: number;

  @ApiProperty({ example: 'https://new-portfolio.com', required: false })
  @IsOptional()
  @IsString()
  portfolioLink?: string;

  @ApiProperty({ example: '7 years', required: false })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DeleteTeacherDto {
  @ApiProperty({ example: 'Teacher violated terms' })
  @IsString()
  reason: string;
}
