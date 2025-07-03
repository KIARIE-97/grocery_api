import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Order, User, Store, Driver, Product]),
  ], 
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
