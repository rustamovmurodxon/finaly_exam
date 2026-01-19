import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Admin username',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Admin password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class TeacherLoginDto {
  @ApiProperty({
    example: 'teacher@example.com',
    description: 'Teacher email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Teacher123!',
    description: 'Teacher password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class TeacherRegisterDto {
  @ApiProperty({
    example: 'teacher@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Mathematics',
    description: 'Subject specialization',
    required: false,
  })
  @IsOptional()
  @IsString()
  specification?: string;

  @ApiProperty({
    example: 50000,
    description: 'Hourly rate in UZS',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourPrice?: number;

  @ApiProperty({
    example: 'Advanced',
    description: 'Teaching level',
    required: false,
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({
    example: 'Experienced math teacher with 5 years of teaching',
    description: 'Description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://portfolio.com',
    description: 'Portfolio link',
    required: false,
  })
  @IsOptional()
  @IsString()
  portfolioLink?: string;

  @ApiProperty({
    example: '5 years',
    description: 'Teaching experience',
    required: false,
  })
  @IsOptional()
  @IsString()
  experience?: string;
}

export class StudentLoginDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'Phone number',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'Student123!',
    description: "Password (opsional, keyinroq SMS/OTP qo'shilishi mumkin)",
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}

export class StudentRegisterDto {
  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Phone number',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'Student123!',
    description: 'Password (opsional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: '@johndoe',
    description: 'Telegram username',
    required: false,
  })
  @IsOptional()
  @IsString()
  tgUsername?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Telegram ID (bot uchun)',
    required: false,
  })
  @IsOptional()
  @IsString()
  tgid?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh-token-here',
    description: 'Refresh token',
  })
  @IsString()
  refreshToken: string;
}

export class LoginDto extends AdminLoginDto {}

export class RegisterDto extends TeacherRegisterDto {}
