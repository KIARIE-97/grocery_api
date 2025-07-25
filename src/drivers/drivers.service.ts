import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { Repository } from 'typeorm';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(User)
      private readonly userRepository: Repository<User>,
  ) {}

  async create(createDriverDto: CreateDriverDto) {
    const existingUser = await this.userRepository.findOneBy({
      id: createDriverDto.user_id,
      // role: Role.DRIVER,
    }
  );

    if (!existingUser) {
      throw new NotFoundException(
        `user with id ${createDriverDto.user_id} not found`,
      );
    }
    if (existingUser.role !== Role.DRIVER) {
      throw new BadRequestException('User is not assigned the driver role');
    }
    const newDriver = this.driverRepository.create({
      vehicle_info: createDriverDto.vehicle_info,
      is_available: createDriverDto.is_available,
      current_location: createDriverDto.current_location,
      total_earnings: createDriverDto.total_earnings,
      user: existingUser, 
    });
const savedDriver = await this.driverRepository.save(newDriver);
return savedDriver;
  }

  async findAll(): Promise<Driver[]> {
    return await this.driverRepository.find({
      relations: ['user', 'orders'],
    });
  }

  async findOne(id: number): Promise<Driver | string> {
    return await this.driverRepository
      .findOne({ where: { id }, relations: ['user', 'orders'] })
      .then((driver) => {
        if (!driver) {
          return `No driver found with id ${id}😬`;
        }
        return driver;
      })
      .catch((error) => {
        console.error('Error finding driver:', error);
        throw new Error(`Failed to find driver with id ${id}`);
      });
  }

  async update(id: number, updateDriverDto: UpdateDriverDto): Promise<Driver | string> {
    await this.driverRepository.update(id, updateDriverDto);
    return await this.findOne(id);
  }

 async remove(id: number) {
    return  await this.driverRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return `❌No driver found with id ${id} to delete`;
        }
        return `Driver with id ${id} deleted successfully✔️`;
      })
      .catch((error) => {
        console.error('Error deleting driver:', error);
        throw new Error(`Failed to delete driver with id ${id}`);
      });
  }

async searchDrivers(query: string): Promise<Driver[]> {
    return await this.driverRepository
      .createQueryBuilder('driver')
      .where('driver.vehicle_info ILIKE :query', { query: `%${query}%` })
      .orWhere('driver.current_location ILIKE :query', { query: `%${query}%` })
      .orWhere('driver.user.full_name ILIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('driver.user', 'user')
      .getMany();
  }

}
