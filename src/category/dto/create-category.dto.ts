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
}
