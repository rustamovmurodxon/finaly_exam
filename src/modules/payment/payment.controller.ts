import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, CancelPaymentDto } from '../../dtos/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'qituvchiga to'lov yaratish" })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "ID bo'yicha to'lovni olish" })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Get('teacher/:teacherId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "O'qituvchining barcha to'lovlarini olish" })
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.paymentService.findByTeacher(teacherId);
  }

  @Post(':id/complete')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "To'lovni amalga oshirish" })
  complete(@Param('id') id: string) {
    return this.paymentService.complete(id);
  }

  @Post(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "To'lovni bekor qilish" })
  cancel(@Param('id') id: string, @Body() cancelDto: CancelPaymentDto) {
    return this.paymentService.cancel(id, cancelDto.reason);
  }
}
