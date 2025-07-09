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
import { Readable } from 'stream';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  private base64ToBuffer(base64: string): {
    buffer: Buffer;
    originalname: string;
  } {
    // Remove the data:image/...;base64, part
    const base64Data = base64.split(';base64,').pop() as string;
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract file extension from the base64 string
    const matches = base64.match(/^data:image\/([A-Za-z-+/]+);base64,/);
    const extension = matches ? matches[1] : 'jpg';

    return {
      buffer,
      originalname: `image.${extension}`,
    };
  }

  async create(
    createProductDto: CreateProductDto,
    user_id: number,
  ): Promise<Product> {
    // Find the store and its owner
    //   const store_owner = await this.storeRepository.findOne({
    //     where: { id: createProductDto.store },
    //     relations: ['user'],
    //   });
    //   if (!store_owner) {
    //     throw new NotFoundException('Store not found');
    //   }

    //   // Find the user and check their role
    //  //below line gets the user from the store's repository
    //   const userRepo = this.storeRepository.manager.getRepository(User);
    //   const user = await userRepo.findOne({ where: { id: user_id } });
    //   console.log(user);
    //   if (!user) {
    //     throw new NotFoundException('User not found');
    //   }

    //   // Only allow if user is store owner or admin
    //   const isStoreOwner = store_owner.user.id === user_id;
    //   const isAdmin = user.role === Role.ADMIN;
    //   if (!isStoreOwner && !isAdmin) {
    //     throw new UnauthorizedException(
    //       'You are not authorized to create a product for this store',
    //     );
    //   }
    const userRepo = this.storeRepository.manager.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: user_id },
      relations: ['stores'], 
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user has multiple stores, pick the first or handle as needed
    const userStore = Array.isArray(user.stores) ? user.stores[0] : user.stores;
    if (!userStore) {
      throw new NotFoundException('User does not have a store');
    }
    let imageUrl: string | undefined;
    let publicId: string | undefined;

    if (createProductDto.product_image?.startsWith('data:image')) {
      const { buffer, originalname } = this.base64ToBuffer(
        createProductDto.product_image,
      );
      const mockStream = new Readable();
      mockStream.push(buffer);
      mockStream.push(null);
      const file: Express.Multer.File = {
        buffer,
        originalname,
        encoding: '7bit',
        mimetype:
          createProductDto.product_image.match(/^data:(.*?);/)?.[1] ||
          'image/jpeg',
        size: buffer.length,
        fieldname: 'image',
        destination: '',
        filename: originalname,
        path: '',
        stream: mockStream,
      };
      console.log('middle');
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      console.log(uploadResult);
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      imageUrl = createProductDto.product_image;
    }
    const newProduct = this.productRepository.create({
      product_name: createProductDto.product_name,
      product_description: createProductDto.product_description,
      product_price: createProductDto.product_price,
      quatity: createProductDto.quatity,
      size: createProductDto.size,
      is_available: createProductDto.is_available,
      product_image: imageUrl,
      // public_id: publicId,
      stock: createProductDto.stock,
      store: { id: userStore.id }, 
    });

    const savedProduct = await this.productRepository.save(newProduct);
    return savedProduct;
  }

  async findAvailableProducts() {
    const availableProducts = await this.productRepository.find({
      where: { is_available: true },
      relations: ['store', 'orders', 'categories'],
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
    console.log('update');
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['store', 'categories'],
    });
    console.log('product', product);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Find the store and its owner
    // const store = await this.storeRepository.findOne({
    //   where: { id: product.store.id },
    //   relations: ['user'],
    // });
    // if (!store) {
    //   throw new NotFoundException('Store not found');
    // }
    // if (store.user.id !== user_id && store.user.role !== Role.ADMIN) {
    //   throw new ForbiddenException(
    //     'You are not authorized to update this product',
    //   );
    // }
    // const updateData: any = { ...updateProductDto };

    // // If store is present and is a number, convert it to an object
    // if (updateProductDto.store && typeof updateProductDto.store === 'number') {
    //   updateData.store = { id: updateProductDto.store };
    // }

    // Transform store property if present and is a number
    const updateData: any = { ...updateProductDto };
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
