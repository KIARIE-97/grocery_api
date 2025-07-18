import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as Bcrypt from 'bcrypt';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
      @InjectRepository(Order)
        private readonly OrderRepository: Repository<Order>,
  ) {}
  private async hashData(data: string): Promise<string> {
    const salt = await Bcrypt.genSalt(10);
    return Bcrypt.hash(data, salt);
  }
  private excludePassword(user: User): Partial<User> {
    const { password, hashedRefreshToken, ...rest } = user;
    return rest;
  }
  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      select: ['id'],
    });
    if (existingUser) {
      throw new Error(`User with email ${createUserDto.email} already exists`);
    }
    const newUser: Partial<User> = {
      full_name: createUserDto.full_name,
      email: createUserDto.email,
      password: await this.hashData(createUserDto.password),
      phone_number: createUserDto.phone_number,
      profile_url: createUserDto.profile_url,
    };
    const savedUser = await this.userRepository.save(newUser);
    return this.excludePassword(savedUser);
  }

  async findAll(): Promise<Partial<User>[]> {
    let users: User[];
    users = await this.userRepository.find({
      relations: ['stores', 'orders', 'driver'],
    });
    return users;

    // return users.map((user) => this.excludePassword(user));
  }
  async findAllCustomers(): Promise<Partial<User>[]> {
    const customers = await this.userRepository.find({
      where: { role: Role.CUSTOMER},
      relations: ['stores', 'orders', 'driver'],
    });
    return customers.map((customer) => this.excludePassword(customer));
  }
  //find one customer
  async findOneCustomer(id: number): Promise<Partial<User> | string> {
    const customer = await this.userRepository.findOne({
      where: { id, role: Role.CUSTOMER },
      relations: ['stores', 'orders', 'orders.products', 'driver'],
    });
    if (!customer) {
      return `No customer found with id ${id}`;
    }
    return this.excludePassword(customer);
  }
  async findAllAdmins(): Promise<Partial<User>[]> {
    const admins = await this.userRepository.find({
      where: { role: Role.ADMIN },
      relations: ['stores', 'orders', 'driver'],
    });
    return admins.map((admin) => this.excludePassword(admin));
  }
  async findAllStoreOwners(): Promise<Partial<User>[]> {
    const storeOwners = await this.userRepository.find({
      where: { role: Role.STORE_OWNER },
      relations: ['stores', 'orders', 'driver'],
    });
    return storeOwners.map((storeOwner) => this.excludePassword(storeOwner));
  }
  async findAllDrivers(): Promise<Partial<User>[]> {
    const drivers = await this.userRepository.find({
      where: { role: Role.DRIVER },
      relations: ['stores', 'orders', 'driver'],
    });
    return drivers.map((driver) => this.excludePassword(driver));
  }


  async findOne(id: number): Promise<User | string> {
    return await this.userRepository
      .findOneBy({ id })
      .then((user) => {
        if (!user) {
          return `No user found with id ${id}`;
        }
        return user;
      })
      .catch((error) => {
        console.error('Error finding user:', error);
        throw new Error(`Failed to find user with id ${id}`);
      });
  }

  async resetPassword(user_id: number, newPassword: string): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }
    user.password = await this.hashData(newPassword);
    await this.userRepository.save(user);
    return 'Password reset successfully';
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | string> {
    // Convert otp to string if present
    const updateData = { ...updateUserDto } as any;
    if (updateData.otp !== undefined && updateData.otp !== null) {
      updateData.otp = String(updateData.otp);
    }
    await this.userRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<string> {
    return await this.userRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return `No user found with id ${id}`;
        }
        return `user with id ${id} has been removed`;
      })
      .catch((error) => {
        console.error('Error removing user:', error);
        throw new Error(`Failed to remove user with id ${id}`);
      });
  }

  async myProfile(requestedId: number, authenticatedUserId: number): Promise<User | string> {
    if (requestedId !== authenticatedUserId) {
      throw new Error('You are not authorized to access this profile');
    }
    console.log(`Fetching profile for requestedId: ${requestedId}, authenticatedUserId: ${authenticatedUserId}`);
    return await this.userRepository
      .findOneBy({ id: requestedId })
      .then((profile) => {
        if (!profile) {
          return `No profile found with requestedId ${requestedId}`;
        }
        return profile;
      })
      .catch((error) => {
        console.error('Error finding profile:', error);
        throw new Error(`Failed to find profile with requestedId ${requestedId}`);
      });
  }
    async getPreferences(userId: number): Promise<string[]> {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['orders', 'orders.products'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      // If user has no orders, return empty preferences
      if (!user.orders || user.orders.length === 0) {
        return []; 
      }
      
      const result = await this.OrderRepository
        .createQueryBuilder('o')
        .innerJoin('o.items', 'oi')
        .innerJoin('oi.product', 'p')
        .innerJoin('p.category', 'c')
        .select('c.name', 'category')
        .addSelect('COUNT(*)', 'frequency')
        .where('o.customer_id = :userId', { userId })
        .groupBy('c.name')
        .orderBy('frequency', 'DESC')
        .limit(3)
        .getRawMany();
  console.log('Preferences:', result);
      return result.map((r) => r.category);
    }
}
