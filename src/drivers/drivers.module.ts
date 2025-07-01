import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Driver } from './entities/driver.entity';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User, Driver, Order])
  ],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
