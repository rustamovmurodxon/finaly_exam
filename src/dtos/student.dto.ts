import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsPhoneNumber('UZ')
  phoneNumber: string;

  @ApiProperty({ example: '@johndoe', required: false })
  @IsOptional()
  @IsString()
  tgUsername?: string;
}

export class UpdateStudentDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '@newusername', required: false })
  @IsOptional()
  @IsString()
  tgUsername?: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  tgid?: string;
}

export class BlockStudentDto {
  @ApiProperty({ example: 'Violated platform rules' })
  @IsString()
  reason: string;
}
