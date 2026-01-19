import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Teacher } from '../../entities/teacher.entity';
import { DeletedTeacher } from '../../entities/deleted-teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, DeletedTeacher])],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
