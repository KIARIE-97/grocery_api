import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";


export class CreateStoreDto {
   @ApiProperty({
    description: 'The name of the store',
    example: 'Best Electronics',
    required: true,
   })
   @IsString()
   store_name: string;

   @ApiProperty({
    description: 'The location of the store',
    example: '123 Main St, Springfield',
    required: true,
   })
    @IsString()
    location: string;

    @ApiProperty({
    description: 'Indicates if the store is verified',
    example: true,
    })
    is_verified: boolean;

    @ApiProperty({
      description: 'Opening time of the store (HH:mm:ss)',
      example: '08:00:00',
      required: false,
    })
    @IsString()
    opening_time?: string;

    @ApiProperty({
      description: 'Closing time of the store (HH:mm:ss)',
      example: '20:00:00',
      required: false,
    })
    @IsString()
    closing_time?: string;

    @ApiProperty({
      description: 'Description of the store',
      example: 'A one-stop shop for all your grocery needs.',
      required: false,
    })
    @IsString()
    description?: string;

    @ApiProperty({
      description: 'URL or path to the shop image',
      example: 'https://example.com/image.jpg',
      required: false,
    })
    @IsString()
    shop_image?: string;

    @ApiProperty({
    description: 'The ID of the user who owns the store',
    example: 1,
    required: true,
    })
    @IsNumber()
    user: number;
}