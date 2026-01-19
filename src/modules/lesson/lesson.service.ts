import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Lesson } from '../../entities/lesson.entity';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Notification } from '../../entities/notification.entity';
import { CreateLessonDto, UpdateLessonDto } from '../../dtos/lesson.dto';
import { LessonStatus } from '@/entities/enums/lesson-status.enum';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private configService: ConfigService,
  ) {}

  async create(createLessonDto: CreateLessonDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: createLessonDto.teacherId },
    });
    const student = await this.studentRepository.findOne({
      where: { id: createLessonDto.studentId },
    });

    if (!teacher || !student) {
      throw new NotFoundException("O'qituvchi yoki o'quvchi topilmadi");
    }

    const meetLink = await this.createGoogleMeetEvent(
      teacher,
      student,
      createLessonDto,
    );

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      price: createLessonDto.price || teacher.hourPrice,
      googleMeetLink: meetLink,
      status: LessonStatus.PENDING,
    });

    await this.lessonRepository.save(lesson);

    const transaction = this.transactionRepository.create({
      lessonId: lesson.id,
      studentId: createLessonDto.studentId,
      price: lesson.price,
      status: LessonStatus.PENDING,
    });
    await this.transactionRepository.save(transaction);

    const reminderTime = new Date(createLessonDto.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30);

    const notification = this.notificationRepository.create({
      studentId: createLessonDto.studentId,
      lessonId: lesson.id,
      message: `Sizga yangi dars tayinlandi: ${lesson.name}`,
      sendAt: reminderTime,
      isSend: false,
    });
    await this.notificationRepository.save(notification);

    return {
      success: true,
      message: 'Dars muvaffaqiyatli yaratildi',
      data: lesson,
    };
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [items, totalCount] = await this.lessonRepository.findAndCount({
      where,
      relations: ['teacher', 'student'],
      skip,
      take: limit,
      order: { startTime: 'DESC' },
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
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['teacher', 'student'],
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    return {
      success: true,
      data: lesson,
    };
  }

  async findByTeacher(teacherId: string) {
    const lessons = await this.lessonRepository.find({
      where: { teacherId },
      relations: ['student'],
      order: { startTime: 'DESC' },
    });

    return {
      success: true,
      data: lessons,
    };
  }

  async findByStudent(studentId: string) {
    const lessons = await this.lessonRepository.find({
      where: { studentId },
      relations: ['teacher'],
      order: { startTime: 'DESC' },
    });

    return {
      success: true,
      data: lessons,
    };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    Object.assign(lesson, updateLessonDto);
    await this.lessonRepository.save(lesson);

    return {
      success: true,
      message: 'Dars yangilandi',
      data: lesson,
    };
  }

  async cancel(id: string, reason: string) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    lesson.status = LessonStatus.CANCELLED;
    await this.lessonRepository.save(lesson);

    const transaction = await this.transactionRepository.findOne({
      where: { lessonId: id },
    });

    if (transaction) {
      transaction.status = LessonStatus.CANCELLED;
      transaction.cancelledTime = new Date();
      transaction.reason = reason;
      await this.transactionRepository.save(transaction);
    }

    return {
      success: true,
      message: 'Dars bekor qilindi',
      data: true,
    };
  }

  async complete(id: string) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    lesson.status = LessonStatus.COMPLETED;
    lesson.completedAt = new Date();
    await this.lessonRepository.save(lesson);

    const transaction = await this.transactionRepository.findOne({
      where: { lessonId: id },
    });

    if (transaction) {
      transaction.status = LessonStatus.COMPLETED;
      transaction.performedTime = new Date();
      await this.transactionRepository.save(transaction);
    }

    return {
      success: true,
      message: 'Dars yakunlandi',
      data: true,
    };
  }

  private async createGoogleMeetEvent(
    teacher: Teacher,
    student: Student,
    dto: any,
  ): Promise<string> {
    try {
      return (
        'https://meet.google.com/placeholder-' +
        Math.random().toString(36).substring(7)
      );
    } catch (error) {
      console.error('Google Meet yaratishda xatolik:', error);
      return 'https://meet.google.com/placeholder';
    }
  }
}
