import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Location } from './entities/location.entity';
import { OrsGeocodingService } from './utils/ors.geocoding.service';
import { UsersService } from 'src/users/users.service';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Location, User, Order])],
  controllers: [LocationController],
  providers: [LocationService, OrsGeocodingService, UsersService],
})
export class LocationModule {}
