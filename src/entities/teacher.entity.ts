import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { DeletedTeacher } from './deleted-teacher.entity';
import { TeacherPayment } from './teacher-payment.entity';
import { UserRole } from './admin.entity';
import * as bcrypt from 'bcrypt'
@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordIfNeeded() {
    if (!this.password) return;

    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
      return;
    }

    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ nullable: true })
  cardNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TEACHER })
  role: UserRole;

  @Column({ nullable: true })
  specification: string;

  @Column({ nullable: true })
  level: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourPrice: number;

  @Column({ nullable: true })
  portfolioLink: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  googleRefreshToken: string;

  @Column({ nullable: true })
  googleAccessToken: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ nullable: true })
  experience: string;

  @OneToMany(() => Lesson, (lesson) => lesson.teacher)
  lessons: Lesson[];

  @OneToMany(() => DeletedTeacher, (deleted) => deleted.teacher)
  deletedRecords: DeletedTeacher[];

  @OneToMany(() => TeacherPayment, (payment) => payment.teacher)
  payments: TeacherPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
