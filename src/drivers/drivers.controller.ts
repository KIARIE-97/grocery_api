import { Controller, Get, Post, Body, Patch, Param, Delete, Search, Query, ParseIntPipe } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('drivers')
@ApiBearerAuth('access-token')
@ApiTags('Drivers')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new driver',
    description: 'Creates a new driver with the provided details.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all drivers',
    description: 'Retrieves a list of all drivers.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  findAll() {
    return this.driversService.findAll();
  }

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

  @Get(':id')
  @ApiOperation({
    summary: 'Get driver by ID',
    description: 'Retrieves a driver by their unique ID.',
  })
  @ApiBadRequestResponse({ description: 'Invalid driver ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

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
