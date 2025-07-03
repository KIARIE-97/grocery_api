import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    user_id: number,
  ): Promise<Product> {
    const store_owner = await this.storeRepository.findOne({
      where: { id: createProductDto.store },
      relations: ['user'],
    });
    if (!store_owner) {
      throw new NotFoundException('store_owner not found');
    }

    if (store_owner.user.id !== user_id) {
      throw new UnauthorizedException('You do not own this store_owner');
    }

    const newProduct = this.productRepository.create({
      product_name: createProductDto.product_name,
      product_description: createProductDto.product_description,
      product_price: createProductDto.product_price,
      quatity: createProductDto.quatity,
      size: createProductDto.size,
      is_available: createProductDto.is_available,
      image_url: createProductDto.image_url,
    });

    const savedProduct = await this.productRepository.save(newProduct);

    return savedProduct;
  }

  async findAvailableProducts() {
    const availableProducts = await this.productRepository.find({
      where: { is_available: true },
    });
    return availableProducts;
  }

  async findOne(id: number) {
    return await this.productRepository
      .findOne({
        where: { id, is_available: true },
        relations: ['store'],
      })
      .then((product) => {
        if (!product) {
          return `❌ No product found with id ${id}`;
        }
        return product;
      })
      .catch((error) => {
        console.error('Error finding product:', error);
        throw new Error(`Failed to find product with id ${id}`);
      });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user_id: number,
  ) {
    // Find the product and its store
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['store'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Find the store and its owner
    const store = await this.storeRepository.findOne({
      where: { id: product.store.id },
      relations: ['user'],
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.user.id !== user_id && store.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }
    const updateData: any = { ...updateProductDto };

    // If store is present and is a number, convert it to an object
    if (updateProductDto.store && typeof updateProductDto.store === 'number') {
      updateData.store = { id: updateProductDto.store };
    }

    await this.productRepository.update(id, updateData);
    return await this.findOne(id);
  }

  /**
   * Soft remove a product: set is_available=false, set deleted_at, and check for associated orders.
   * Only allow if no associated orders exist.
   */
  async remove(id: number) {
    // Find the product and its store
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['store', 'orders'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // If product has associated orders, do not allow removal
    if (product.orders && product.orders.length > 0) {
      throw new ForbiddenException(
        'Cannot delete product with associated orders',
      );
    }

    // Soft delete: set is_available to false and set deleted_at
    product.is_available = false;
    product.deleted_at = new Date();
    await this.productRepository.save(product);

    return { message: 'Product removed 🧹🧹 successfully' };
  }
}
