import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TeacherPayment } from '../../entities/teacher-payment.entity';
import { Teacher } from '../../entities/teacher.entity';
import { Lesson } from '../../entities/lesson.entity';
import { CreatePaymentDto } from '../../dtos/payment.dto';
import { LessonStatus } from '@/entities/enums/lesson-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(TeacherPayment)
    private paymentRepository: Repository<TeacherPayment>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    private configService: ConfigService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: createPaymentDto.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    const lessons = await this.lessonRepository.find({
      where: {
        id: In(createPaymentDto.lessonIds),
        status: LessonStatus.COMPLETED,
      },
    });

    if (lessons.length === 0) {
      throw new NotFoundException('Yakunlangan darslar topilmadi');
    }

    const totalLessonAmount = lessons.reduce(
      (sum, lesson) => sum + Number(lesson.price),
      0,
    );
    const commissionPercentage = this.configService.get<number>(
      'PLATFORM_COMMISSION_PERCENTAGE',
      15,
    );
    const platformCommission = (totalLessonAmount * commissionPercentage) / 100;
    const teacherAmount = totalLessonAmount - platformCommission;

    const payment = this.paymentRepository.create({
      teacherId: createPaymentDto.teacherId,
      lessons: createPaymentDto.lessonIds,
      totalLessonAmount,
      platformCommission,
      platformAmount: platformCommission,
      teacherAmount,
      capacity: teacherAmount,
      notes: createPaymentDto.notes,
      isCancelled: false,
    });

    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: "To'lov yaratildi",
      data: payment,
    };
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }

    return {
      success: true,
      data: payment,
    };
  }

  async findByTeacher(teacherId: string) {
    const payments = await this.paymentRepository.find({
      where: { teacherId },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: payments,
    };
  }

  async complete(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }

    if (payment.isCancelled) {
      throw new Error("Bu to'lov bekor qilingan");
    }

    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: "To'lov amalga oshirildi",
      data: true,
    };
  }

  async cancel(id: string, reason: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }

    payment.isCancelled = true;
    payment.cancelledAt = new Date();
    payment.cancelledReason = reason;
    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: "To'lov bekor qilindi",
      data: true,
    };
  }
}
