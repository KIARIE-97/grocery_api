import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Role, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SStatus, Store } from './entities/store.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    // @InjectRepository(Order)
    // private readonly orderRepository: Repository<Order>,
  ) {}
  async create(createStoreDto: CreateStoreDto) {
    const existingUser = await this.userRepository.findOneBy({
      id: createStoreDto.user,
      // role: Role.STORE_OWNER,
    });

    if (!existingUser) {
      throw new NotFoundException(
        `user with id ${createStoreDto.user} not found or is not a store owner😬`,
      );
    }
    const newStore = this.storeRepository.create({
      store_name: createStoreDto.store_name,
      // location: createStoreDto.location,
      is_verified: false,
      user: existingUser,
    });
    const savedStore = await this.storeRepository.save(newStore);
    return savedStore;
  }

  async findAll() {
    return await this.storeRepository.find({
      relations: ['user', 'orders', 'products'],
    });
  }

  async findOne(id: number) {
    return await this.storeRepository
      .findOne({ where: { id }, relations: ['user', 'orders', 'products','products.categories', 'products.orders'] })
      .then((store) => {
        if (!store) {
          throw new NotFoundException(`No store found with id ${id}😬`);
        }
        return store;
      })
      .catch((error) => {
        console.error('Error finding store:', error);
        throw new NotFoundException(`Error finding store with id ${id}`);
      });
  }

  async getOrdersForStore(storeId: number) {
    // Find all orders that have at least one product from this store
    const orders = await this.storeRepository.manager
      .getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.products', 'product')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.store', 'store')
      .where('product.store = :storeId', { storeId })
      .getMany();

    return orders;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    const updateData = { ...updateStoreDto } as any;
    if (updateStoreDto.user !== undefined) {
      updateData.user = { id: updateStoreDto.user };
    }
    await this.storeRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number, current_user: User) {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!store) {
      throw new NotFoundException(`No store found with id ${id}😬`);
    }
    const isStoreOwner = current_user.role === Role.STORE_OWNER;
    const isAdmin = current_user.role === Role.ADMIN;

    // if(isStoreOwner || isAdmin &&  store.user.id !== current_user.id) {
    //   throw new ForbiddenException(`You are not authorized to delete this store`);
    // }

    if (!isStoreOwner && !isAdmin) {
      throw new ForbiddenException(
        `Only store owners and admin can delete stores`,
      );
    }

    // Check if the store is verified before deletion
    store.status = SStatus.INACTIVE;
    await this.storeRepository.save(store);

    await this.storeRepository.delete(id);
    return { message: `Store with id ${id} has been deleted successfully` };
  }
}
