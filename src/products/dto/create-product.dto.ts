import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
  // @ApiProperty({
  //   description: 'The ID of the store to which the product belongs',
  //   example: 1,
  //   required: true,
  // })
  // @IsNumber()
  // store: number;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Apple',
    required: true,
  })
  @IsString()
  product_name: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Fresh and juicy apples',
  })
  @IsString()
  product_description: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 1.99,
    required: true,
  })
  @IsNumber()
  product_price: number;

  @ApiProperty({
    description: 'The quantity of the product',
    example: 100,
    required: true,
  })
  @IsNumber()
  quatity: number;

  @ApiProperty({
    description: 'The number of the product in store',
    example: 100,
    required: true,
  })
  @IsNumber()
  @IsOptional()
  stock: number;

  @ApiProperty({
    description: 'The size of the product',
    example: 'Medium',
    required: false,
  })
  @IsString()
  @IsOptional()
  size: string;

  @ApiProperty({
    description: 'Indicates if the product is available',
    example: true,
    required: true,
  })
  @IsBoolean()
  is_available: boolean;

  @ApiProperty({
    description: 'The URL of the product image',
    example: 'https://example.com/image.jpg',
    required: true,
  })
  product_image: string;

  @ApiProperty({
    description: 'The category ids',
    example: '1',
  })
  @IsNumber()
  categories: number[];
}
