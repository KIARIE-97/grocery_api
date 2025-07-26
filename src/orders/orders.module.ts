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
import { Location } from 'src/location/entities/location.entity';
import { OrsGeocodingService } from 'src/location/utils/ors.geocoding.service';
import { AppMailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Order, User, Store, Driver, Product, Location]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrsGeocodingService, AppMailerService],
})
export class OrdersModule {}
