import { ApiProperty } from "@nestjs/swagger";
import { isEnum, IsEnum, IsNumber } from "class-validator";
import { OStatus, paymentMethod, paymentStatus } from "../entities/order.entity";

export class CreateOrderDto {
  @ApiProperty({
    description: 'The total cost of the order',
    example: 'ksh.50.00',
    required: true,
  })
  @IsNumber()
  total_amount: number;

  @ApiProperty({
    description: 'The tax on the current order',
    example: 'ksh.50.00',
    required: true,
  })
  @IsNumber()
  tax_amount: number;

  @ApiProperty({
    description: 'this is the status of the order',
    example: 'pending',
    required: true,
  })
  @IsEnum(OStatus, { message: 'status' })
  status: OStatus = OStatus.PENDING;

  @ApiProperty({
    description: 'the payment method of choice',
    example: 'cash',
    required: true,
  })
  @IsEnum(paymentMethod, { message: 'payment_method' })
  payment_method: paymentMethod = paymentMethod.COD;

  @ApiProperty({
    description: 'The status of the payment',
    example: 'ksh.50.00',
  })
  @IsEnum(paymentStatus, { message: 'payment_status' })
  payment_status: paymentStatus= paymentStatus.PENDING;

  @ApiProperty({
    description: 'The tax on the current order',
    example: '2023-10-01',
    required: true,
  })
  @IsNumber()
  delivery_schedule_at: number;

  @ApiProperty({
    description: 'The driver id',
    example: '1',
    required: true,
  })
  @IsNumber()
  driver_id: number;

  @ApiProperty({
    description: 'The store id',
    example: '1',
    required: true,
  })
  @IsNumber()
  store_id: number;

  @ApiProperty({
    description: 'The customer id',
    example: '1',
    required: true,
  })
  @IsNumber()
  customer_id: number;
}
