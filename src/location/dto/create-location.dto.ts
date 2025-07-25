import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { OwnerType } from '../entities/location.entity';

export class CreateLocationDto {
  @IsEnum(['user', 'store', 'driver'])
  @IsOptional()
  ownerType: OwnerType;

  @IsString()
  @IsOptional()
  ownerId: string;

  @ApiProperty({
    example: 'Home',
    description: 'Label for the location (e.g. Home, Work)',
  })
  @IsString()
  @IsOptional()
  label: string;

  @IsOptional()
  @IsEmail()
  email?: string; // only used by admin

  @ApiProperty({ example: '123 Main St', description: 'Primary address line' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({ example: 'Nairobi', description: 'City name' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Nairobi County', description: 'county' })
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty({ example: '00100', description: 'Postal or ZIP code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'Kenya', description: 'Country name' })
  @IsOptional()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Set as default location',
  })
  @IsOptional()
  isDefault?: boolean;
}