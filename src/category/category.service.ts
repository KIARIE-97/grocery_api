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
    const newCategory = this.categoryRepository.create({
      category_name: createCategoryDto.category_name,
    });

    const savedCategory = await this.categoryRepository.save(newCategory);
    return savedCategory;
  }

  async findAll() {
    return await this.categoryRepository.find({
      relations: ['products'],
    });
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { products, ...rest } = updateCategoryDto;
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) throw new Error('Category not found');

    Object.assign(category, rest);

    if (products && Array.isArray(products)) {
      // You need to fetch product entities by their ids
      category.products = products.map((productId: number) => ({
        id: productId,
      })) as any;
    }

    await this.categoryRepository.save(category);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id);
    return {
      message: `category with id ${id} has been deleted 🧹🧹 successfully`,
    };
  }
}
