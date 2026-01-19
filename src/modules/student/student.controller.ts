import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  BlockStudentDto,
} from '../../dtos/student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Students')
@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('schedule/today')
  @ApiOperation({
    summary: 'Bugungi darslar (Bot uchun)',
    description: 'Student telefon raqami orqali bugungi darslar jadvali',
  })
  @ApiResponse({
    status: 200,
    description: 'Bugungi darslar muvaffaqiyatli olindi',
  })
  getTodaySchedule(@Query('phoneNumber') phoneNumber: string) {
    return this.studentService.getSchedule(phoneNumber, 1);
  }

  @Get('schedule/weekly')
  @ApiOperation({
    summary: 'Haftalik jadval (Bot uchun)',
    description: 'Student telefon raqami orqali haftalik darslar jadvali',
  })
  @ApiResponse({
    status: 200,
    description: 'Haftalik jadval muvaffaqiyatli olindi',
  })
  getWeeklySchedule(@Query('phoneNumber') phoneNumber: string) {
    return this.studentService.getSchedule(phoneNumber, 7);
  }

  @Get('payments')
  @ApiOperation({
    summary: "To'lov holati (Bot uchun)",
    description: "Student qarz va to'lovlar statistikasi",
  })
  @ApiResponse({
    status: 200,
    description: "To'lov holati muvaffaqiyatli olindi",
  })
  getPayments(@Query('phoneNumber') phoneNumber: string) {
    return this.studentService.getPaymentStatus(phoneNumber);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Botdan chiqish',
    description: "Student telegram ID sini o'chirish",
  })
  @ApiResponse({
    status: 200,
    description: 'Tizimdan muvaffaqiyatli chiqdingiz',
  })
  logout(@Body('phoneNumber') phoneNumber: string) {
    return this.studentService.logoutFromBot(phoneNumber);
  }

  @Public()
  @Get('upcoming-lessons')
  @UseGuards()
  @ApiOperation({
    summary: 'Yaqinlashayotgan darslar (Eslatma uchun)',
    description: "Belgilangan vaqt oralig'ida boshlanadigan darslar",
  })
  @ApiResponse({
    status: 200,
    description: "Yaqinlashayotgan darslar ro'yxati",
  })
  async getUpcomingLessons(
    @Query('minutesBefore') minutesBefore: string = '30',
    @Headers('x-bot-secret') secret: string,
  ) {
    const lessons = await this.studentService.getUpcomingLessons(
      parseInt(minutesBefore),
    );

    return {
      success: true,
      data: lessons,
    };
  }

  @Post()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Yangi o'quvchi yaratish" })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Barcha o'quvchilarni olish" })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.studentService.findAll(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "ID bo'yicha o'quvchini olish" })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'quvchi ma'lumotlarini yangilash" })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Post(':id/block')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'quvchini bloklash" })
  block(@Param('id') id: string, @Body() blockDto: BlockStudentDto) {
    return this.studentService.block(id, blockDto.reason);
  }

  @Post(':id/unblock')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'quvchini blokdan chiqarish" })
  unblock(@Param('id') id: string) {
    return this.studentService.unblock(id);
  }
}
