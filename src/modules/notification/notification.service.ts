import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async findByStudent(studentId: string) {
    const notifications = await this.notificationRepository.find({
      where: { studentId },
      relations: ['lesson'],
      order: { sendAt: 'DESC' },
    });

    return {
      success: true,
      data: notifications,
    };
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (notification) {
      notification.isSend = true;
      await this.notificationRepository.save(notification);
    }

    return {
      success: true,
      data: true,
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendPendingNotifications() {
    const now = new Date();
    const pending = await this.notificationRepository.find({
      where: {
        isSend: false,
        sendAt: LessThanOrEqual(now),
      },
      relations: ['student', 'lesson'],
    });

    for (const notification of pending) {
      try {
        console.log(
          `Sending notification to ${notification.student.phoneNumber}: ${notification.message}`,
        );

        notification.isSend = true;
        await this.notificationRepository.save(notification);
      } catch (error) {
        console.error('Notification yuborishda xatolik:', error);
      }
    }
  }
}
