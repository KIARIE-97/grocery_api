import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'fruits',
    required: true,
  })
  @IsString()
  category_name: string;
  
  @IsString()
  description: string;

  @IsString()
  image: string;

  @ApiProperty({
    description: 'The products in the category',
    example: [1, 2, 3],
    required: false,
  })
  products: number[];
}
