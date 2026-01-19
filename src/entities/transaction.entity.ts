import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Student } from './student.entity';
import { LessonStatus } from './enums/lesson-status.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: string;

  @ManyToOne(() => Student, (student) => student.transactions)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: LessonStatus, default: LessonStatus.PENDING })
  status: LessonStatus;

  @Column({ type: 'timestamp', nullable: true })
  cancelledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  performedTime: Date;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
