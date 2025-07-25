import { Controller, Get, Post, Body, Patch, Param, Delete, Search, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';

@UseGuards(RolesGuard)
@Controller('drivers')
@ApiBearerAuth('access-token')
@ApiTags('Drivers')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new driver',
    description: 'Creates a new driver with the provided details.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }
  
  @Roles(Role.ADMIN, Role.DRIVER, Role.CUSTOMER, Role.STORE_OWNER)
  @Get()
  @ApiOperation({
    summary: 'Get all drivers',
    description: 'Retrieves a list of all drivers.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  findAll() {
    return this.driversService.findAll();
  }

  @Roles(Role.ADMIN, Role.DRIVER)
  @Get('query')
  @ApiOperation({
    summary: 'Search drivers by query',
    description: 'Searches for drivers based on a query string.',
  })
  @ApiBadRequestResponse({ description: 'Invalid query string' })
  search(@Query('query') query?: string) {
    if (query) {
      return this.driversService.searchDrivers(query);
    }
    return this.driversService.findAll();
  }
 
  @Roles(Role.ADMIN, Role.DRIVER, Role.CUSTOMER, Role.STORE_OWNER)
  @Get(':id')
  @ApiOperation({
    summary: 'Get driver by ID',
    description: 'Retrieves a driver by their unique ID.',
  })
  @ApiBadRequestResponse({ description: 'Invalid driver ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }
 
  @Roles(Role.ADMIN, Role.DRIVER, Role.CUSTOMER)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update driver details',
    description: 'Updates the details of an existing driver.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Roles(Role.ADMIN, Role.DRIVER)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a driver',
    description: 'Deletes a driver by their unique ID.',
  })
  @ApiBadRequestResponse({ description: 'Invalid driver ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.remove(id);
  }
}
