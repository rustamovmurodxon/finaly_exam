import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UnauthorizedException,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  AdminLoginDto,
  TeacherLoginDto,
  TeacherRegisterDto,
  StudentLoginDto,
  StudentRegisterDto,
  ChangePasswordDto,
} from '../../dtos/auth.dto';
import { UserRole } from '@/entities/admin.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auth module health check' })
  @ApiResponse({ status: 200, description: 'Health check response' })
  healthCheck() {
    return {
      success: true,
      message: 'Auth module ishlayapti',
      endpoints: {
        admin: 'POST /auth/admin/login',
        teacher: {
          login: 'POST /auth/teacher/login',
          register: 'POST /auth/teacher/register',
          google: 'POST /auth/teacher/google',
        },
        student: {
          login: 'POST /auth/student/login',
          register: 'POST /auth/student/register',
        },
        profile: 'GET /auth/profile',
        changePassword: 'POST /auth/change-password',
        logout: 'POST /auth/logout',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Admin login muvaffaqiyatli',
    schema: {
      example: {
        success: true,
        message: 'Admin muvaffaqiyatli login qilindi',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid',
            username: 'admin',
            role: 'admin',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Username yoki parol noto'g'ri" })
  async adminLogin(@Body() loginDto: AdminLoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Post('admin/register')
  @ApiOperation({ summary: 'Admin yaratish' })
  @ApiBody({ type: AdminLoginDto })
  async adminRegister(@Body() dto: AdminLoginDto) {
    return this.authService.adminRegister(dto);
  }

  @Post('teacher/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "O'qituvchi login (Email + Password)" })
  @ApiBody({ type: TeacherLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Teacher login muvaffaqiyatli',
    schema: {
      example: {
        success: true,
        message: "O'qituvchi muvaffaqiyatli login qilindi",
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid',
            email: 'teacher@example.com',
            fullName: 'John Doe',
            role: 'teacher',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Email yoki parol noto'g'ri" })
  async teacherLogin(@Body() loginDto: TeacherLoginDto) {
    return this.authService.teacherLogin(loginDto);
  }

  @Post('teacher/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "O'qituvchi ro'yxatdan o'tish" })
  @ApiBody({ type: TeacherRegisterDto })
  @ApiResponse({
    status: 201,
    description: "Ro'yxatdan o'tish muvaffaqiyatli",
    schema: {
      example: {
        success: true,
        message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid',
            email: 'teacher@example.com',
            fullName: 'John Doe',
            role: 'teacher',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email allaqachon mavjud' })
  async teacherRegister(@Body() registerDto: TeacherRegisterDto) {
    return this.authService.teacherRegister(registerDto);
  }
  @Post('student/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "O'quvchi login (Phone Number)" })
  @ApiBody({ type: StudentLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Student login muvaffaqiyatli',
    schema: {
      example: {
        success: true,
        message: "O'quvchi muvaffaqiyatli login qilindi",
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid',
            phoneNumber: '+998901234567',
            firstName: 'John',
            lastName: 'Doe',
            role: 'student',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Telefon raqam topilmadi' })
  async studentLogin(@Body() loginDto: StudentLoginDto) {
    return this.authService.studentLogin(loginDto);
  }

  @Post('student/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "O'quvchi ro'yxatdan o'tish" })
  @ApiBody({ type: StudentRegisterDto })
  @ApiResponse({
    status: 201,
    description: "Ro'yxatdan o'tish muvaffaqiyatli",
    schema: {
      example: {
        success: true,
        message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid',
            phoneNumber: '+998901234567',
            firstName: 'John',
            lastName: 'Doe',
            role: 'student',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Telefon raqam allaqachon mavjud' })
  async studentRegister(@Body() registerDto: StudentRegisterDto) {
    return this.authService.studentRegister(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Foydalanuvchi profilini olish (Token kerak)' })
  @ApiResponse({
    status: 200,
    description: "Profil ma'lumotlari",
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'teacher@example.com',
          fullName: 'John Doe',
          role: 'teacher',
          createdAt: '2024-12-25T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Token yo'q yoki noto'g'ri" })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.userId, req.user.role);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Parolni o'zgartirish (Token kerak)" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: "Parol muvaffaqiyatli o'zgartirildi",
    schema: {
      example: {
        success: true,
        message: "Parol muvaffaqiyatli o'zgartirildi",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Eski parol noto'g'ri" })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto, req.user.role);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Logout (Client tomonida token o'chiriladi)",
    description:
      "Server JWT stateless bo'lgani uchun tokenni o'chirmaydi. Client localStorage'dan o'chirishi kerak.",
  })
  @ApiResponse({
    status: 200,
    description: 'Logout muvaffaqiyatli',
    schema: {
      example: {
        success: true,
        message: "Muvaffaqiyatli logout qilindi. Token'ni o'chiring.",
      },
    },
  })
  logout() {
    return {
      success: true,
      message:
        "Muvaffaqiyatli logout qilindi. Token'ni client tomonida o'chiring.",
    };
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Barcha adminlarni olish (faqat admin uchun)' })
  async getAllAdmins(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Faqat adminlar uchun');
    }
    return this.authService.getAllAdmins();
  }

  @Patch('admins/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adminni yangilash' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: { username?: string; phoneNumber?: string; password?: string },
  ) {
    return this.authService.updateAdmin(id, dto);
  }

  @Delete('admins/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Adminni o'chirish" })
  async deleteAdmin(@Param('id') id: string) {
    return this.authService.deleteAdmin(id);
  }
}
