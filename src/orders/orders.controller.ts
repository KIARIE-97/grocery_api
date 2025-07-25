import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateStatusDto } from './dto/update-order.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';

// @Public()
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Public()
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  // @Roles(Role.ADMIN, Role.STORE_OWNER)
  @Public()
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Roles(Role.STORE_OWNER, Role.DRIVER)
  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    console.log(
      `Updating order status for order_id: ${orderId} to ${updateStatusDto.status}`,
    );
    return this.ordersService.updateOrderStatus(
      orderId,
      updateStatusDto.status,
    );
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Patch(':orderId/assign-store/:storeId')
  async assignStore(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.ordersService.assignStore(orderId, storeId);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER, Role.DRIVER, Role.CUSTOMER)
  @Patch(':orderId/assign-driver/:driverId')
  async assignDriver(
    @Param('orderId') orderId: string,
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.ordersService.assignDriver(orderId, driverId);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Roles(Role.ADMIN, Role.STORE_OWNER, Role.CUSTOMER)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.remove(id, req.user);
  }
}
