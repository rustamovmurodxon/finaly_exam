import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { DeletedTeacher } from '../../entities/deleted-teacher.entity';
import { CreateTeacherDto, UpdateTeacherDto } from '../../dtos/teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(DeletedTeacher)
    private deletedTeacherRepository: Repository<DeletedTeacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const exists = await this.teacherRepository.findOne({
      where: { email: createTeacherDto.email },
    });

    if (exists) {
      throw new ConflictException('Bu email allaqachon mavjud');
    }

    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      isActive: true,
      isDeleted: false,
    });

    await this.teacherRepository.save(teacher);

    return {
      success: true,
      message: "O'qituvchi muvaffaqiyatli yaratildi",
      data: teacher,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isDeleted: false };

    if (search) {
      where.fullName = Like(`%${search}%`);
    }

    const [items, totalCount] = await this.teacherRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: {
        items,
        totalCount,
        pageNumber: page,
        pageSize: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    return {
      success: true,
      data: teacher,
    };
  }

  async findActive() {
    const teachers = await this.teacherRepository.find({
      where: { isActive: true, isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: teachers,
    };
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    Object.assign(teacher, updateTeacherDto);
    await this.teacherRepository.save(teacher);

    return {
      success: true,
      message: "O'qituvchi ma'lumotlari yangilandi",
      data: teacher,
    };
  }

  async delete(id: string, deletedBy: string, reason: string) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    teacher.isDeleted = true;
    teacher.isActive = false;
    await this.teacherRepository.save(teacher);

    const deletedRecord = this.deletedTeacherRepository.create({
      teacherId: id,
      deletedBy,
      reason,
      deletedAt: new Date(),
    });

    await this.deletedTeacherRepository.save(deletedRecord);

    return {
      success: true,
      message: "O'qituvchi o'chirildi",
      data: true,
    };
  }

  async restore(id: string) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    teacher.isDeleted = false;
    teacher.isActive = true;
    await this.teacherRepository.save(teacher);

    const deletedRecord = await this.deletedTeacherRepository.findOne({
      where: { teacherId: id, restoredAt: null },
    });

    if (deletedRecord) {
      deletedRecord.restoredAt = new Date();
      await this.deletedTeacherRepository.save(deletedRecord);
    }

    return {
      success: true,
      message: "O'qituvchi qayta tiklandi",
      data: true,
    };
  }
}
