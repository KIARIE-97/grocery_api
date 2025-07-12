import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuthenticatedRequest } from 'src/users/users.controller';
@ApiTags('Payment')
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  async payWithPhoneNumber(
    @Req() req: AuthenticatedRequest,
    @Body() createPaymentDto:CreatePaymentDto,
  ) {
    // userId from JWT
    const userId = req.user && req.user.sub ? req.user.sub : null;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.paymentService.payWithPhoneNumber(userId, createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }
  // Removed broken getMyProfile endpoint
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
