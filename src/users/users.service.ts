import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as Bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async findOne(id: number): Promise<User | string> {
    return await this.userRepository
      .findOneBy({ id })
      .then((profile) => {
        if (!profile) {
          return `No profile found with id ${id}`;
        }
        return profile;
      })
      .catch((error) => {
        console.error('Error finding profile:', error);
        throw new Error(`Failed to find profile with id ${id}`);
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
}
