import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  DeleteTeacherDto,
} from '../../dtos/teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Teachers')
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Yangi o'qituvchi yaratish (Admin)" })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Barcha o'qituvchilarni olish" })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.teacherService.findAll(page, limit, search);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: "Faol o'qituvchilar" })
  findActive() {
    return this.teacherService.findActive();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: "ID bo'yicha o'qituvchi" })
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'qituvchi ma’lumotlarini yangilash" })
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @Request() req,
  ) {
    if (!req.user) {
      throw new ForbiddenException("Token noto'g'ri yoki yo'q");
    }

    if (req.user.role === 'teacher' && req.user.userId !== id) {
      throw new ForbiddenException(
        "Siz faqat o'z profilingizni yangilashingiz mumkin",
      );
    }

    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'qituvchini o'chirish (Admin)" })
  delete(
    @Param('id') id: string,
    @Body() deleteDto: DeleteTeacherDto,
    @Request() req,
  ) {
    return this.teacherService.delete(id, req.user.userId, deleteDto.reason);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'qituvchini tiklash (Admin)" })
  restore(@Param('id') id: string) {
    return this.teacherService.restore(id);
  }
}
