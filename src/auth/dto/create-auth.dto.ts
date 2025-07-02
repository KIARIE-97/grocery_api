import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'strongpassword123',
    minLength: 4,
    maxLength: 32,
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
