import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/entities/product.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { StoresService } from 'src/stores/stores.service';
import { Store } from 'src/stores/entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Product, Store]),
    CloudinaryModule,
  ],
  controllers: [GeminiController],
  providers: [
    GeminiService,
    UsersService,
    ProductsService,
    CloudinaryService,
    StoresService,
  ],
})
export class GeminiModule {}
