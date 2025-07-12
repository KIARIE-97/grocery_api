import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'User ID making the payment' })
  @IsNumber()
  @IsOptional()
  user: User;

  @ApiProperty({
    description: 'Order ID this payment belongs to',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order: Order;

  @ApiProperty({ description: 'Total amount to be paid', example: 1500.75 })
  @IsNumber()
  @IsOptional()
  amount: number;

  @ApiProperty({
    description: 'Phone number for MPESA payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method: PaymentMethod;

  //   @ApiProperty({
  //     description: 'Transaction ID from payment provider',
  //     required: false,
  //   })
  //   @IsString()
  //   @IsOptional()
  //   transactionId?: string;

  //   @ApiProperty({
  //     description: 'Raw response from payment provider (JSON/string)',
  //     required: false,
  //   })
  //   @IsString()
  //   @IsOptional()
  //   paymentProviderResponse?: string;
}
