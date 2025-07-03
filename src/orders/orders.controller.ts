import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Public()
@ApiBearerAuth('access-token')
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':orderId/assign-store/:storeId')
  async assignStore(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.ordersService.assignStore(orderId, storeId);
  }

  @Patch(':orderId/assign-driver/:driverId')
  async assignDriver(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.ordersService.assignDriver(orderId, driverId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.remove(id, req.user);
  }
}
