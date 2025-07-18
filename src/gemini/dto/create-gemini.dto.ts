import { IsNotEmpty, IsString } from "class-validator";

export class GenerateGeminiDto {
  @IsString()
  @IsNotEmpty({ message: 'Prompt must not be empty' })
  prompt: string;
}