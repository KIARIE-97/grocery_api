import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Role, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SStatus, Store } from './entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}
  async create(createStoreDto: CreateStoreDto) {
    const existingUser = await this.userRepository.findOneBy({
      id: createStoreDto.user_id,
      role: Role.STORE_OWNER,
    });

    if (!existingUser) {
      throw new NotFoundException(
        `user with id ${createStoreDto.user_id} not found or is not a store owner😬`,
      );
    }
    const newStore = this.storeRepository.create({
      store_name: createStoreDto.store_name,
      location: createStoreDto.location,
      is_verified: createStoreDto.is_verified,
      user: existingUser,
    });
    const savedStore = await this.storeRepository.save(newStore);
    return savedStore;
  }

  async findAll() {
    return await this.storeRepository.find({
      relations: ['user', 'product'],
    });
  }

  async findOne(id: number) {
    return await this.storeRepository
      .findOne({ where: { id }, relations: ['user'] })
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

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    await this.storeRepository.update(id, updateStoreDto);
    return await this.findOne(id);
  }

  async remove(id: number, current_user: User) {
    const store = await this.storeRepository.findOne({ where: { id },
      relations: ['user']});
    if (!store) {
      throw new NotFoundException(`No store found with id ${id}😬`);
    }
    const isStoreOwner = current_user.role === Role.STORE_OWNER;

    if(isStoreOwner &&  store.user.id !== current_user.id) {
      throw new ForbiddenException(`You are not authorized to delete this store`);
    }

    if (!isStoreOwner) {
      throw new ForbiddenException(`Only store owners can delete stores`);
    }

    // Check if the store is verified before deletion
    store.status = SStatus.INACTIVE;
    await this.storeRepository.save(store);

    await this.storeRepository.delete(id);
    return { message: `Store with id ${id} has been deleted successfully` };
  }
}
