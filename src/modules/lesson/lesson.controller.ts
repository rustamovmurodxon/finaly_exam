import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  CancelLessonDto,
} from '../../dtos/lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Lessons')
@Controller('lesson')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yangi dars yaratish' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Barcha darslarni olish' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.lessonService.findAll(page, limit, status);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "ID bo'yicha darsni olish" })
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Get('teacher/:teacherId')
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'qituvchi darslarini olish" })
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.lessonService.findByTeacher(teacherId);
  }

  @Get('student/:studentId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'quvchi darslarini olish" })
  findByStudent(@Param('studentId') studentId: string) {
    return this.lessonService.findByStudent(studentId);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Darsni yangilash' })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Post(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Darsni bekor qilish' })
  cancel(@Param('id') id: string, @Body() cancelDto: CancelLessonDto) {
    return this.lessonService.cancel(id, cancelDto.reason);
  }

  @Post(':id/complete')
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Darsni yakunlash' })
  complete(@Param('id') id: string) {
    return this.lessonService.complete(id);
  }
}
