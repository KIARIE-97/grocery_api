import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User, Order])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
