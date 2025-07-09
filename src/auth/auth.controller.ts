import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { RtGuard } from './guards/rt.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
    refreshToken: string;
  };
}
// @ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //signin user
  @Public() 
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiUnauthorizedResponse({ description: 'Authentication failed' })
  @Post('signin')
  signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto);
  }

  //signout user
  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out a user by invalidating their refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiBadRequestResponse({ description: 'Invalid user ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('signout/:id')
  signOut(@Param('id', ParseIntPipe) id: number) {
    console.log('Signout hit');
    return this.authService.signOut(id);
  }

  //refersh token
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  refreshTokens(
    @Query('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    console.log('Refresh hit');
    const user = req.user;
    console.log('User from request:', typeof user.sub);
    console.log('User ID from query:', typeof id);
    console.log(' request:', user.sub !== id);
    if (user.sub !== id) {
      throw new UnauthorizedException('Invalid user');
    }
    return this.authService.refreshTokens(id, user.refreshToken);
  }

  //signup user
  @Public() 
  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.SignUp(createUserDto);
  }
}
