import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsString,
} from 'class-validator';
import { Role } from "../entities/user.entity";


export class CreateUserDto {
  @ApiProperty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'example@mail.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strongpassword123',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
    required: true,
  })
  @IsString()
  phone_number: string;

  @ApiProperty()
  @IsEnum(Role, {
    message: 'Role must be one of the following: CUSTOMER, ADMIN, DRIVER, STORE_OWNER',
  })
  role: Role = Role.CUSTOMER;

  @ApiProperty({
    description: 'The profile URL of the user',
    example: 'https://example.com/profile/user123',
    required: true,
  })
  @IsString()
  profile_url: string;

  @ApiProperty({ default: false })
  is_active?: boolean = false;
}