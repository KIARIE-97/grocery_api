import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateDriverDto {
    @ApiProperty({
        description: 'Information about the vehicle of the driver',
        example: 'Toyota Camry 2020, Blue, License Plate: ABC1234'
    })
    @IsString()
    vehicle_info: string;

    @ApiProperty({
        description: 'Availability status of the driver',
        example: true
    })
    @IsBoolean()
    is_available: boolean;

    @ApiProperty({
        description: 'Current location of the driver',
        example: '123 Main St, Springfield, IL'
    })
    @IsString()
    current_location: string;

    @ApiProperty({
        description: 'Total earnings of the driver',
        example: 1500.00
    })
    @IsNumber()
    total_earnings: number;
    
    @ApiProperty({
        description: 'ID of the user associated with the driver',
        example: 1
    })
    @IsNumber()
    user_id: number;
}
