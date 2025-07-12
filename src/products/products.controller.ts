import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';

@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    
    console.log('controller hit');
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Get()
  findAll() {
    return this.productsService.findAvailableProducts();
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
