import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from '../../entities/student.entity';
import { Lesson } from '@/entities/lesson.entity';
import { Transaction } from '@/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Lesson, Transaction])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
