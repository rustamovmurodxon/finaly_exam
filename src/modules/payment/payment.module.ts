import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TeacherPayment } from '../../entities/teacher-payment.entity';
import { Teacher } from '../../entities/teacher.entity';
import { Lesson } from '../../entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherPayment, Teacher, Lesson]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
