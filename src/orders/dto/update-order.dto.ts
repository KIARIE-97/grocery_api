import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { OStatus } from '../entities/order.entity';
import { IsEnum } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class UpdateStatusDto {
  @IsEnum(OStatus)
  status: OStatus;
}
