import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = await this.categoryRepository.create({
      category_name: createCategoryDto.category_name,
    });
    return newCategory;
  }

 async findAll() {
    return await this.categoryRepository.find();
  }

  async  findOne(id: number) {
    return await this.categoryRepository.find({
      relations: ['product'],
    });  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
     await this.categoryRepository.update(id, updateCategoryDto);
     return await this.findOne(id)
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id) 
    return { message: `category with id ${id} has been deleted 🧹🧹 successfully` };  }
}
