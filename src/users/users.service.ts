import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
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
      password: createUserDto.password, // Ensure to hash the password before saving
      phone_number: createUserDto.phone_number,
      role: createUserDto.role,
      profile_url: createUserDto.profile_url,
      is_active: createUserDto.is_active ?? false, // Default to false if not provided
    };
    const savedUser = await this.userRepository.save(newUser);
    return savedUser;
  }

  async findAll(): Promise<Partial<User>[]> {
    let users: User[];
    users = await this.userRepository.find({
      relations: ['stores', 'orders', 'driver'],
    });
    return users;

    // return users.map((user) => this.excludePassword(user));
  }

  findOne(id: number): Promise<User | string> {
    return this.userRepository
      .findOneBy({ id},
      )
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

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | string> {
    await this.userRepository.update(id, updateUserDto);

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
}
