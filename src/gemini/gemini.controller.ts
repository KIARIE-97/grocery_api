import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiResponseDto, GenerateGeminiDto } from './dto/create-gemini.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { AuthenticatedRequest } from 'src/users/users.controller';

@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Roles(Role.CUSTOMER, Role.STORE_OWNER, Role.ADMIN, Role.DRIVER)
  // @Public()
  // @Post('generate')
  // async generate(
  //   @Body() dto: GenerateGeminiDto,
  //   @Req() req: AuthenticatedRequest,
  // ) {
  //   console.log('Authenticated user:', req.user);
  //   const userId = req.user?.sub;
  //   const response = await this.geminiService.generateText(userId, dto.prompt);
  //   return { response };
  // }
  @Post('generate')
  async generate(
    @Body() dto: GenerateGeminiDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GeminiResponseDto> {
    const userId = req.user?.sub;
    return this.geminiService.generateText(userId, dto.prompt);
  }

  @Public()
  @Post('generate/guest')
  async generateTextForGuest(@Body() body: { prompt: string }) {
    return this.geminiService.generateText(null, body.prompt);
  }
}

