import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { Order } from 'src/orders/entities/order.entity';
import { Location } from 'src/location/entities/location.entity';
import { LocationService } from 'src/location/location.service';
import { OrsGeocodingService } from 'src/location/utils/ors.geocoding.service';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User, Order, Location])],
  controllers: [UsersController],
  providers: [UsersService, LocationService, OrsGeocodingService],
})
export class UsersModule {}
