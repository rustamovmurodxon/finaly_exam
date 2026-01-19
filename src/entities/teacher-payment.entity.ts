import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Teacher } from './teacher.entity';

@Entity('teacher_payments')
export class TeacherPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.payments)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: string;

  @Column('text', { array: true })
  lessons: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalLessonAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  teacherAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capacity: number;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ default: false })
  isCancelled: boolean;

  @Column({ nullable: true })
  cancelledReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
