import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { OAuth2Client } from 'google-auth-library';
// import { ConfigService } from '@nestjs/config';
import { Admin, UserRole } from '../../entities/admin.entity';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import {
  AdminLoginDto,
  TeacherLoginDto,
  TeacherRegisterDto,
  StudentLoginDto,
  StudentRegisterDto,
  ChangePasswordDto,
} from '../../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private jwtService: JwtService,
  ) {}

  async adminLogin(loginDto: AdminLoginDto) {
    const { username, password } = loginDto;

    const admin = await this.adminRepository.findOne({ where: { username } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException("Username yoki parol noto'g'ri");
    }

    const token = this.generateToken(admin.id, admin.username, UserRole.ADMIN);

    return {
      success: true,
      message: 'Admin muvaffaqiyatli login qilindi',
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          role: UserRole.ADMIN,
        },
      },
    };
  }

  async getAllAdmins() {
    const admins = await this.adminRepository.find({
      select: [
        'id',
        'username',
        'phoneNumber',
        'role',
        'createdAt',
        'updatedAt',
      ],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: admins,
    };
  }
  async updateAdmin(
    id: string,
    dto: { username?: string; phoneNumber?: string; password?: string },
  ) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new BadRequestException('Admin topilmadi');
    }

    if (dto.username && dto.username !== admin.username) {
      const exists = await this.adminRepository.findOne({
        where: { username: dto.username },
      });
      if (exists) throw new ConflictException('Bu username band');
      admin.username = dto.username;
    }

    if (dto.phoneNumber !== undefined) {
      admin.phoneNumber = dto.phoneNumber || null;
    }

    if (dto.password) {
      admin.password = await bcrypt.hash(dto.password, 10);
    }

    await this.adminRepository.save(admin);

    return {
      success: true,
      message: 'Admin muvaffaqiyatli yangilandi',
    };
  }

  async deleteAdmin(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new BadRequestException('Admin topilmadi');
    }

    await this.adminRepository.remove(admin);

    return {
      success: true,
      message: "Admin muvaffaqiyatli o'chirildi",
    };
  }

  async adminRegister(loginDto: AdminLoginDto) {
    const { username, password } = loginDto;

    const exists = await this.adminRepository.findOne({
      where: { username },
    });

    if (exists) {
      throw new ConflictException('Admin allaqachon mavjud');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.adminRepository.create({
      username,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await this.adminRepository.save(admin);

    return {
      success: true,
      message: 'Admin muvaffaqiyatli yaratildi',
    };
  }

  async teacherLogin(loginDto: TeacherLoginDto) {
    const { email, password } = loginDto;

    const teacher = await this.teacherRepository.findOne({
      where: { email, isDeleted: false },
    });

    if (!teacher) {
      throw new UnauthorizedException('Email topilmadi');
    }

    if (!(await bcrypt.compare(password, teacher.password))) {
      throw new UnauthorizedException("Parol noto'g'ri");
    }

    if (!teacher.isActive) {
      throw new UnauthorizedException(
        "Hisob faol emas. Admin bilan bog'laning",
      );
    }

    const token = this.generateToken(
      teacher.id,
      teacher.email,
      UserRole.TEACHER,
    );

    return {
      success: true,
      message: "O'qituvchi muvaffaqiyatli login qilindi",
      data: {
        token,
        user: {
          id: teacher.id,
          email: teacher.email,
          fullName: teacher.fullName,
          role: UserRole.TEACHER,
          imageUrl: teacher.imageUrl,
        },
      },
    };
  }
  async teacherRegister(registerDto: TeacherRegisterDto) {
    const { email, password, fullName, phoneNumber, specification, hourPrice } =
      registerDto;

    const existingTeacher = await this.teacherRepository.findOne({
      where: { email },
    });

    if (existingTeacher) {
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = this.teacherRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      specification,
      hourPrice: hourPrice || 0,
      role: UserRole.TEACHER,
      isActive: true,
      isDeleted: false,
    });

    await this.teacherRepository.save(teacher);

    const token = this.generateToken(
      teacher.id,
      teacher.email,
      UserRole.TEACHER,
    );

    return {
      success: true,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      data: {
        token,
        user: {
          id: teacher.id,
          email: teacher.email,
          fullName: teacher.fullName,
          role: UserRole.TEACHER,
        },
      },
    };
  }

  async studentLogin(loginDto: StudentLoginDto) {
    const { phoneNumber, password } = loginDto;

    const student = await this.studentRepository.findOne({
      where: { phoneNumber },
    });

    if (!student) {
      throw new UnauthorizedException('Telefon raqam topilmadi');
    }

    if (student.isBlocked) {
      throw new UnauthorizedException(
        `Sizning hisobingiz bloklangan. Sabab: ${student.blockedReason || "Ma'lum emas"}`,
      );
    }

    if (password) {
      throw new BadRequestException(
        "Student password autentifikatsiyasi hali qo'shilmagan",
      );
    }

    const token = this.generateToken(
      student.id,
      student.phoneNumber,
      UserRole.STUDENT,
    );

    return {
      success: true,
      message: "O'quvchi muvaffaqiyatli login qilindi",
      data: {
        token,
        user: {
          id: student.id,
          phoneNumber: student.phoneNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          role: UserRole.STUDENT,
        },
      },
    };
  }

  async studentRegister(registerDto: StudentRegisterDto) {
    let { phoneNumber, firstName, lastName, tgUsername, tgid } = registerDto;

    lastName = lastName && lastName.trim() ? lastName.trim() : '-';

    const existingStudent = await this.studentRepository.findOne({
      where: { phoneNumber },
    });

    if (existingStudent) {
      if (tgid) {
        existingStudent.tgid = tgid;
        existingStudent.tgUsername = tgUsername || existingStudent.tgUsername;
        existingStudent.isBlocked = false;
        await this.studentRepository.save(existingStudent);

        const token = this.generateToken(
          existingStudent.id,
          existingStudent.phoneNumber,
          UserRole.STUDENT,
        );

        return {
          success: true,
          message: 'Qayta tizimga kirdingiz',
          data: {
            token,
            user: {
              id: existingStudent.id,
              phoneNumber: existingStudent.phoneNumber,
              firstName: existingStudent.firstName,
              lastName: existingStudent.lastName,
              role: UserRole.STUDENT,
            },
          },
        };
      }

      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    const student = this.studentRepository.create({
      phoneNumber,
      firstName,
      lastName,
      tgUsername: tgUsername ?? null,
      tgid: tgid || null,
      role: UserRole.STUDENT,
      isBlocked: false,
    });

    await this.studentRepository.save(student);

    const token = this.generateToken(
      student.id,
      student.phoneNumber,
      UserRole.STUDENT,
    );

    return {
      success: true,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      data: {
        token,
        user: {
          id: student.id,
          phoneNumber: student.phoneNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          role: UserRole.STUDENT,
        },
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, role: UserRole) {
    if (role === UserRole.TEACHER) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: userId },
      });

      if (!teacher || !teacher.password) {
        throw new BadRequestException("Parol o'zgartirish mumkin emas");
      }

      if (!(await bcrypt.compare(dto.oldPassword, teacher.password))) {
        throw new UnauthorizedException("Eski parol noto'g'ri");
      }

      teacher.password = await bcrypt.hash(dto.newPassword, 10);
      await this.teacherRepository.save(teacher);

      return {
        success: true,
        message: "Parol muvaffaqiyatli o'zgartirildi",
      };
    }

    throw new BadRequestException("Bu funksiya hali qo'shilmagan");
  }

  async getProfile(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) {
      const admin = await this.adminRepository.findOne({
        where: { id: userId },
      });
      return { success: true, data: { ...admin, password: undefined } };
    }

    if (role === UserRole.TEACHER) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: userId },
      });
      return { success: true, data: { ...teacher, password: undefined } };
    }

    if (role === UserRole.STUDENT) {
      const student = await this.studentRepository.findOne({
        where: { id: userId },
      });
      return { success: true, data: student };
    }

    throw new UnauthorizedException('User topilmadi');
  }

  private generateToken(
    userId: string,
    identifier: string,
    role: UserRole,
  ): string {
    const payload = { sub: userId, identifier, role };
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { id: userId } });
    if (admin) return { ...admin, password: undefined };

    const teacher = await this.teacherRepository.findOne({
      where: { id: userId },
    });
    if (teacher) return { ...teacher, password: undefined };

    const student = await this.studentRepository.findOne({
      where: { id: userId },
    });
    if (student) return student;

    return null;
  }
}
