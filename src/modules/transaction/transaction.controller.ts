import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Transactions')
@Controller('transaction')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Barcha tranzaksiyalarni olish' })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.transactionService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "ID bo'yicha tranzaksiyani olish" })
  findOne(@Param('id') id: number) {
    return this.transactionService.findOne(id);
  }

  @Get('student/:studentId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'quvchining tranzaksiyalarini olish" })
  findByStudent(@Param('studentId') studentId: string) {
    return this.transactionService.findByStudent(studentId);
  }

  @Get('lesson/:lessonId')
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Darsga oid tranzaksiyalarni olish' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.transactionService.findByLesson(lessonId);
  }
}
