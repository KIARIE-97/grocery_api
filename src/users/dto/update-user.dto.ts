import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { CreateLocationDto } from 'src/location/dto/create-location.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  address?: CreateLocationDto;
}
