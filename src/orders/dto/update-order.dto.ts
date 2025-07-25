import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { OStatus } from '../entities/order.entity';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderAddressDto {
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  ownerType: 'user' | 'store' | 'driver' | 'order';

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
//   @IsOptional()
//   @ValidateNested()
//   @Type(() => UpdateOrderAddressDto)
//   delivery_address?: UpdateOrderAddressDto;
// }
export class UpdateStatusDto {
  @IsEnum(OStatus)
  status: OStatus;
}
