import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { OwnerType } from './entities/location.entity';
import { AuthenticatedRequest } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@Controller('location')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly usersService: UsersService,
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

  @Roles(Role.CUSTOMER, Role.DRIVER, Role.STORE_OWNER, Role.ADMIN)
  @Post()
  async createAddress(
    @Body() dto: CreateLocationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    let ownerId: string;
    let ownerType: OwnerType;

    // If ADMIN is adding for someone else
    if (req.user.role === 'admin' && dto.email) {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) throw new NotFoundException('User not found');

      ownerId = user.id.toString();
      ownerType = this.mapRoleToOwnerType(user.role);
    } else {
      // Regular user (driver/store_owner/customer) adding own address
      ownerId = req.user.sub;
      ownerType = this.mapRoleToOwnerType(req.user.role);
    }

    const result = await this.locationService.createAddress({
      ...dto,
      ownerId,
      ownerType,
    });

    return result;
  }
  @Get()
  async getAddresses(
    @Query('ownerId') ownerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    ownerId = req.user.sub;
    return this.locationService.findAddressesByOwner(ownerId);
  }
}
