import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [
    DatabaseModule,TypeOrmModule.forFeature([Product, Order, Store]) 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
