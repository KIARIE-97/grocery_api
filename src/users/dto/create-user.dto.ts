import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
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
    description: 'The OTP for user verification',
    example: 123456,
    required: true,
  })
  @IsOptional()
  @IsString()
  otp: string;

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
  @IsOptional()
  role: Role = Role.CUSTOMER;


  @IsOptional()
  @IsString()
  profile_url: string;

  // @ApiProperty({ default: false })
  // @IsOptional()
  // @IsBoolean()
  // is_active?: boolean = false;
}