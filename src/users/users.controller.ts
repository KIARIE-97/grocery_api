import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role, User } from './entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocationService } from 'src/location/location.service';
import { OwnerType } from 'src/location/entities/location.entity';

export interface AuthenticatedRequest extends Request {
  user: any; 
}

@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly locationService: LocationService,
  ) {}
  private mapRoleToOwnerType(role: string): OwnerType {
 switch (role) {
   case 'customer':
     return 'user';
   case 'driver':
     return 'driver';
   case 'store_owner':
     return 'store';
   default:
     throw new BadRequestException(`Unsupported role: ${role}`);
 }
}

  @Roles(Role.ADMIN)
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided details.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  findAll() {
    return this.usersService.findAll();
  }
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @Get('customers')
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieves a list of all customers.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  findAllCustomers() {
    return this.usersService.findAllCustomers();
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Get('store-owners')
  @ApiOperation({
    summary: 'Get all store owners',
    description: 'Retrieves a list of all store owners.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  findAllStoreOwners() {
    return this.usersService.findAllStoreOwners();
  }

  @Roles(Role.ADMIN, Role.DRIVER)
  @Get('drivers')
  @ApiOperation({
    summary: 'Get all drivers',
    description: 'Retrieves a list of all drivers.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  findAllDrivers() {
    return this.usersService.findAllDrivers();
  }

  @Roles(Role.ADMIN, Role.CUSTOMER, Role.DRIVER, Role.STORE_OWNER)
  @Get('profile')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.usersService.myProfile(userId, userId);
  }

  @Roles(Role.ADMIN, Role.CUSTOMER, Role.DRIVER, Role.STORE_OWNER)
  @Get('customers/:id')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieves a customer by their unique ID.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid user ID' })
  findOneCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneCustomer(id);
  }

  @Roles(Role.ADMIN, Role.CUSTOMER, Role.DRIVER, Role.STORE_OWNER)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid user ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // @Roles(Role.ADMIN, Role.CUSTOMER, Role.DRIVER, Role.STORE_OWNER)
  @Public()
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user details',
    description: 'Updates the details of an existing user.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch()
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Resets the password for a user by their ID.',
  })
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;

    // Handle profile update
    await this.usersService.update(userId, updateUserDto);

    // If address info is included
    if (updateUserDto.address) {
      await this.locationService.createAddress({
        ...updateUserDto.address,
        ownerId: userId,
        ownerType: this.mapRoleToOwnerType(req.user.role),
      });
    }

    return this.usersService.findOne(userId);
  }

  @Roles(Role.ADMIN, Role.CUSTOMER)
  // @Public()
  @Patch(':id/reset-password')
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Resets the password for a user by their ID.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  resetUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  // @Public()
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.DRIVER, Role.STORE_OWNER)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Deletes a user by their unique ID.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid user ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
