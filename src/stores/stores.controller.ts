import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';

@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}
  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Post()
  @ApiOperation({
    summary: 'Create a new store',
    description:
      'This endpoint allows you to create a new store. You must provide the store name, location, verification status, and the user ID of the store owner.',
  })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all stores',
    description: 'This endpoint retrieves a list of all stores.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. You must be logged in to view stores.',
  })
  findAll() {
    return this.storesService.findAll();
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a store by ID',
    description:
      'This endpoint retrieves a store by its ID. You must provide the store ID as a path parameter.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. You must be logged in to view store details.',
  })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a store',
    description:
      'This endpoint allows you to update an existing store. You must provide the store ID as a path parameter and the updated store details in the request body.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. You must be logged in to update a store.',
  })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a store',
    description:
      'This endpoint allows you to delete a store by its ID. You must provide the store ID as a path parameter.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. You must be logged in to delete a store.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.storesService.remove(id, req.user);
  }
}
