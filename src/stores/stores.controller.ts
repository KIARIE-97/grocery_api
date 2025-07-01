import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiOperation, ApiProperty, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new store',
    description: 'This endpoint allows you to create a new store. You must provide the store name, location, verification status, and the user ID of the store owner.',
  })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all stores',
    description: 'This endpoint retrieves a list of all stores.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. You must be logged in to view stores.'})  
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a store by ID',
    description: 'This endpoint retrieves a store by its ID. You must provide the store ID as a path parameter.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. You must be logged in to view store details.'})
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a store',
    description: 'This endpoint allows you to update an existing store. You must provide the store ID as a path parameter and the updated store details in the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. You must be logged in to update a store.'})
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a store',
    description: 'This endpoint allows you to delete a store by its ID. You must provide the store ID as a path parameter.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. You must be logged in to delete a store.'})
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.storesService.remove(id, req.user);
  }
}
