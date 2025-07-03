import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Store } from './entities/store.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [
    DatabaseModule, TypeOrmModule.forFeature([
      User, Store, Product
    ])
  ],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
