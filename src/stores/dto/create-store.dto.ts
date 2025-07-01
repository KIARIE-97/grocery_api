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
    description: 'The ID of the user who owns the store',
    example: 1,
    required: true,
    })
    @IsNumber()
    user_id: number;
}