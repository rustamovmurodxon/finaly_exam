import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { Lesson } from '../../entities/lesson.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateStudentDto, UpdateStudentDto } from '../../dtos/student.dto';
import { LessonStatus } from '../../entities/enums/lesson-status.enum';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const exists = await this.studentRepository.findOne({
      where: { phoneNumber: createStudentDto.phoneNumber },
    });

    if (exists) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    const student = this.studentRepository.create(createStudentDto);
    await this.studentRepository.save(student);

    return {
      success: true,
      message: "O'quvchi muvaffaqiyatli yaratildi",
      data: student,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, totalCount] = await this.studentRepository.findAndCount({
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
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    return {
      success: true,
      data: student,
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    Object.assign(student, updateStudentDto);
    await this.studentRepository.save(student);

    return {
      success: true,
      message: "O'quvchi ma'lumotlari yangilandi",
      data: student,
    };
  }

  async block(id: string, reason: string) {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    student.isBlocked = true;
    student.blockedAt = new Date();
    student.blockedReason = reason;
    await this.studentRepository.save(student);

    return {
      success: true,
      message: "O'quvchi bloklandi",
      data: true,
    };
  }

  async unblock(id: string) {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    student.isBlocked = false;
    student.blockedAt = null;
    student.blockedReason = null;
    await this.studentRepository.save(student);

    return {
      success: true,
      message: "O'quvchi blokdan chiqarildi",
      data: true,
    };
  }

  /**
  
   * @param phoneNumber 
   * @param days 
   */
  async getSchedule(phoneNumber: string, days: number = 1) {
    const student = await this.studentRepository.findOne({
      where: { phoneNumber },
    });

    if (!student) {
      throw new NotFoundException('Student topilmadi');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    const lessons = await this.lessonRepository.find({
      where: {
        studentId: student.id,
        startTime: Between(today, endDate),
      },
      relations: ['teacher'],
      order: { startTime: 'ASC' },
    });

    return {
      success: true,
      data: {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        lessons: lessons.map((lesson) => ({
          id: lesson.id,
          name: lesson.name,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          teacherId: lesson.teacherId,
          teacherName: lesson.teacher?.fullName || "O'qituvchi",
          status: lesson.status,
          price: parseFloat(lesson.price?.toString() || '0'),
          subject: lesson.subject,
          googleMeetLink: lesson.googleMeetLink,
        })),
      },
    };
  }

  /**
  
   * @param phoneNumber 
   */
  async getPaymentStatus(phoneNumber: string) {
    const student = await this.studentRepository.findOne({
      where: { phoneNumber },
    });

    if (!student) {
      throw new NotFoundException('Student topilmadi');
    }

    const completedLessons = await this.lessonRepository.find({
      where: {
        studentId: student.id,
        status: LessonStatus.COMPLETED,
      },
    });

    const payments = await this.transactionRepository.find({
      where: {
        studentId: student.id,
        status: LessonStatus.COMPLETED,
      },
      order: { createdAt: 'DESC' },
    });

    const totalLessonCost = completedLessons.reduce(
      (sum, lesson) => sum + parseFloat(lesson.price?.toString() || '0'),
      0,
    );

    const totalPaid = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.price?.toString() || '0'),
      0,
    );

    const totalDebt = Math.max(0, totalLessonCost - totalPaid);

    const paidLessons = payments.length;
    const unpaidLessons = Math.max(0, completedLessons.length - paidLessons);

    return {
      success: true,
      data: {
        totalDebt: Math.round(totalDebt),
        paidLessons,
        unpaidLessons,
        lastPaymentDate: payments[0]?.createdAt || null,
        totalLessonCost: Math.round(totalLessonCost),
        totalPaid: Math.round(totalPaid),
      },
    };
  }

  /**
   * @param phoneNumber
   */
  async logoutFromBot(phoneNumber: string) {
    const student = await this.studentRepository.findOne({
      where: { phoneNumber },
    });

    if (!student) {
      throw new NotFoundException('Student topilmadi');
    }

    student.tgid = null;
    student.tgUsername = null;
    await this.studentRepository.save(student);

    return {
      success: true,
      message: 'Tizimdan chiqdingiz',
      data: true,
    };
  }

  /**
   * @param minutesBefore
   */
  async getUpcomingLessons(minutesBefore: number = 30) {
    const now = new Date();
    const targetTime = new Date(now.getTime() + minutesBefore * 60000);

    const lessons = await this.lessonRepository.find({
      where: {
        startTime: Between(now, targetTime),
        status: LessonStatus.PENDING,
      },
      relations: ['student', 'teacher'],
    });

    return lessons
      .filter((lesson) => lesson.student?.tgid)
      .map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        student: {
          tgid: lesson.student.tgid,
          firstName: lesson.student.firstName,
          lastName: lesson.student.lastName,
        },
        teacher: {
          fullName: lesson.teacher.fullName,
        },
        googleMeetLink: lesson.googleMeetLink,
      }));
  }
}
