import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsDateString, isEnum, IsEnum, IsNumber, IsOptional } from "class-validator";
import { OStatus, paymentMethod } from "../entities/order.entity";
import { PaymentStatus } from "src/payment/entities/payment.entity";

export class CreateOrderDto {
  @ApiProperty({
    description: 'The total cost of the order',
    example: '50.00',
    required: true,
  })
  @IsNumber()
  total_amount: number;

  @ApiProperty({
    description: 'The tax on the current order',
    example: '50.00',
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
  payment_method: paymentMethod = paymentMethod.MPESA;

  @ApiProperty({
    description: 'The status of the payment',
    example: 'pending',
  })
  @IsEnum(PaymentStatus, { message: 'payment_status' })
  payment_status: PaymentStatus = PaymentStatus.PENDING;

  @ApiProperty({
    description: 'The tax on the current order',
    example: '2023-10-01',
    required: true,
  })
  @IsDateString()
  delivery_schedule_at: string;

  @ApiProperty({
    description: 'The delivery fee for the order',
    example: '5.00',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  delivery_fee?: number;

  @ApiProperty({
    description: 'The driver id',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  driver_id: number;

  @ApiProperty({
    description: 'The store id',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  store_id: string;

  @ApiProperty({
    description: 'The customer id',
    example: '1',
    required: true,
  })
  @IsNumber()
  customer_id: number;

  @ApiProperty({
    description: 'The product ids',
    example: '1',
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  product_ids: number[];

  @ApiProperty({
    description: 'The delivery address',
    example: {
      street: '123 Main St',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      postal_code: '100001',
      latitude: 6.5244,
      longitude: 3.3792,
    },
    required: false,
  })
  @IsOptional()
  delivery_address_id: string;
}
