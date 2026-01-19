import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, totalCount] = await this.transactionRepository.findAndCount({
      relations: ['lesson', 'student'],
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

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['lesson', 'student'],
    });

    if (!transaction) {
      throw new NotFoundException('Tranzaksiya topilmadi');
    }

    return {
      success: true,
      data: transaction,
    };
  }

  async findByStudent(studentId: string) {
    const transactions = await this.transactionRepository.find({
      where: { studentId },
      relations: ['lesson'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: transactions,
    };
  }

  async findByLesson(lessonId: string) {
    const transactions = await this.transactionRepository.find({
      where: { lessonId },
      relations: ['student'],
    });

    return {
      success: true,
      data: transactions,
    };
  }
}
