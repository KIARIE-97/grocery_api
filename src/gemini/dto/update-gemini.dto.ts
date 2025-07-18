import { PartialType } from '@nestjs/swagger';
import { GenerateGeminiDto } from './create-gemini.dto';

export class UpdateGeminiDto extends PartialType(GenerateGeminiDto) {}
