import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { In, Repository } from 'typeorm';
import { Order, OStatus } from './entities/order.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaymentStatus } from 'src/payment/entities/payment.entity';
import { Location } from 'src/location/entities/location.entity';
import { OrsGeocodingService } from 'src/location/utils/ors.geocoding.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly OrderRepository: Repository<Order>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly ors: OrsGeocodingService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const customer = await this.userRepository.findOne({
      where: { id: createOrderDto.customer_id },
    });

    if (!customer || customer.role !== 'customer') {
      throw new NotFoundException('Invalid customer');
    }

    // 1. Validate product IDs
    if (!Array.isArray(createOrderDto.product_ids)) {
      throw new BadRequestException('product_ids must be an array');
    }
    const products = await this.validateProducts(createOrderDto.product_ids);

    const deliveryDate = new Date(createOrderDto.delivery_schedule_at);
    const deliveryDateString = deliveryDate.toISOString().split('T')[0];
    if (isNaN(deliveryDate.getTime())) {
      throw new BadRequestException('Invalid delivery schedule date');
    }
    // 2.create the order
    const newOrder = this.OrderRepository.create({
      total_amount: createOrderDto.total_amount,
      tax_amount: createOrderDto.tax_amount,
      status:
        createOrderDto.payment_status === PaymentStatus.SUCCESS
          ? OStatus.ACCEPTED
          : OStatus.PENDING,
      payment_method: createOrderDto.payment_method,
      payment_status: createOrderDto.payment_status,
      delivery_schedule_at: deliveryDateString,
      customer,
      products,
    });

    const order = await this.OrderRepository.save(newOrder);

    if (order.payment_status === PaymentStatus.SUCCESS) {
      await this.decrementStock(
        createOrderDto.product_ids.map((id: number) => ({ id, quantity: 1 })),
      );
    }

    return order;
  }

  async assignStore(orderId: number, storeId: number): Promise<Order> {
    const order = await this.OrderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    order.store = store;
    order.status = OStatus.PREPARING;
    return await this.OrderRepository.save(order);
  }

  async assignDriver(orderId: string, driverId: number): Promise<Order> {
    const order = await this.OrderRepository.findOne({
      where: { order_id: orderId },
      relations: ['driver'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['user'],
    });
    if (!driver || driver.user.role !== 'driver') {
      throw new NotFoundException('Driver not found or is not a driver');
    }

    order.driver = driver;
    order.status = OStatus.OUT_FOR_DELIVERY;
    return await this.OrderRepository.save(order);
  }
  async findAll() {
    return this.OrderRepository.find({
      relations: ['products', 'customer', 'store', 'driver'],
    });
  }

  async updateOrderStatus(orderId: string, newStatus: OStatus): Promise<Order> {
    const order = await this.OrderRepository.findOne({
      where: { order_id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = newStatus;
    return await this.OrderRepository.save(order);
  }

  async findOne(id: number) {
    return await this.OrderRepository.findOne({
      where: { id },
      relations: [
        'products',
        'customer',
        'products.store',
        'products.categories',
        'driver',
        'delivery_address',
        'payment',
      ],
    })
      .then((order) => {
        if (!order) {
          return `❌ No order found with id ${id}`;
        }
        return order;
      })
      .catch((error) => {
        console.error('Error finding order:', error);
        throw new Error(`Failed to find order with id ${id}`);
      });
  }

  private async calculateDeliveryFee(storeLocation: string, deliveryAddress: string): Promise<number> {
  try {
    const distance = await this.ors.calculateDistance(
      storeLocation, 
      deliveryAddress
    );
    return (distance * 10) / 100; // KSH 10 per meter
  } catch (error) {
    // this.logger.error('Delivery fee calculation failed', error.stack);
    console.error('Delivery fee calculation failed:', error);
    return 0; // Fallback
  }
}
  // async update(id: number, updateOrderDto: UpdateOrderDto) {
  //   const order = await this.OrderRepository.findOne({
  //     where: { id },
  //     relations: ['delivery_address'],
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order ${id} not found`);
  //   }

  //   // Handle delivery address update
  //   if (updateOrderDto.delivery_address) {
  //     if (order.delivery_address) {
  //       // Convert UpdateOrderAddressDto to LocationUpdateDto
  //       const locationUpdate: Partial<Location> = {
  //         address_line1: updateOrderDto.delivery_address.addressLine1,
  //         city: updateOrderDto.delivery_address.city,
  //         state: updateOrderDto.delivery_address.state,
  //         postalCode: updateOrderDto.delivery_address.postalCode,
  //         country: updateOrderDto.delivery_address.country,
  //       };

  //       await this.locationRepository.update(
  //         order.delivery_address.id,
  //         locationUpdate,
  //       );
  //     } else {
  //       // Create new address
  //       const newAddress = this.locationRepository.create({
  //         ...updateOrderDto.delivery_address,
  //         ownerType: 'order',
  //         ownerId: id.toString(),
  //       });
  //       await this.locationRepository.save(newAddress);
  //       order.delivery_address = newAddress;
  //       await this.OrderRepository.save(order);
  //     }
  //   }

  //   // Handle other updates
  //   const { delivery_address, ...rest } = updateOrderDto;
  //   await this.OrderRepository.update(id, rest);

  //   return this.OrderRepository.findOne({
  //     where: { id },
  //     relations: ['delivery_address'],
  //   });
  // }

  // In your OrderService:
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.OrderRepository.findOne({
      where: { id },
      relations: ['store', 'delivery_address'], // Ensure these relations are loaded
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    // Store the original delivery address for comparison
    // const originalDeliveryAddressId = order.delivery_address?.id;

    // Convert delivery_address_id to the relation
    if (updateOrderDto.delivery_address_id) {
      const location = await this.locationRepository.findOne({
        where: { id: Number(updateOrderDto.delivery_address_id) },
      });
      if (!location) {
        throw new NotFoundException('Delivery location not found');
      }
      order.delivery_address = { ...location } as any;
      delete updateOrderDto.delivery_address_id;
    }

      if (updateOrderDto.store_id) {
        const store = await this.storeRepository.findOne({
          where: { id: Number(updateOrderDto.store_id) },
        });
        if (!store) {
          throw new NotFoundException('Store not found');
        }
        order.store = store;
        delete updateOrderDto.store_id;
      }
    // Calculate delivery fee if:
    // // 1. Delivery address was changed OR
    // // 2. Store was changed (if store_id is in update DTO)
    // const shouldCalculateFee =
    //   (updateOrderDto.delivery_address_id &&
    //     originalDeliveryAddressId !==
    //       Number(updateOrderDto.delivery_address_id)) ||
    //   (updateOrderDto.store_id && order.store?.id !== updateOrderDto.store_id);

    // if (shouldCalculateFee && order.store && order.delivery_address) {
    //   try {
    //     const distance = await this.ors.calculateDistance(
    //       order.store.location,
    //       order.delivery_address.addressLine1,
    //     );
    //     // KSH 10 per meter
    //     order.delivery_fee = (distance * 10) / 100; // Convert to currency
    //   } catch (error) {
    //     console.error('Failed to calculate delivery fee:', error);
    //     // You can choose to throw an error or continue with default fee
        // order.delivery_fee = 0; // Default value
      // }
    // }
    if (order.store && order.delivery_address) {
      order.delivery_fee = await this.calculateDeliveryFee(
        order.store.location,
        order.delivery_address.addressLine1,
      );
    }
    console.log('order', order);
console.log('store', order.store);
    // Merge other updates
    this.OrderRepository.merge(order, updateOrderDto);

    return this.OrderRepository.save(order);
  }

  async remove(id: number, currentUser: User): Promise<any> {
    const order = await this.OrderRepository.findOne({
      where: { id },
      relations: ['user', 'driver'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isAdmin = currentUser.role === 'admin';
    const isCustomer = currentUser.role === 'customer'; // adjust as per your roles
    const isDriver = currentUser.role === 'driver';

    // Customer can cancel own order only (before 24 hrs)
    if (isCustomer) {
      const isOwner = order.customer.id === currentUser.id;
      const cancelDeadline = new Date(order.delivery_schedule_at);
      cancelDeadline.setHours(cancelDeadline.getHours() - 24);
      const now = new Date();

      if (!isOwner) {
        throw new ForbiddenException('You can only cancel your own orders');
      }

      if (now > cancelDeadline) {
        throw new BadRequestException(
          'Cannot cancel within 24 hours of the scheduled time',
        );
      }
    }

    // Driver can cancel only their assigned order
    if (isDriver && (!order.driver || order.driver.id !== currentUser.id)) {
      throw new ForbiddenException(
        'You can only cancel orders assigned to you',
      );
    }

    // Instead of deleting, mark it cancelled
    order.status = OStatus.CANCELLED;
    await this.OrderRepository.save(order);

    return { message: 'Order cancelled successfully' };
  }

  async searchOrders(
    status?: OStatus,
    delivery_schedule_at?: Date,
  ): Promise<Order[]> {
    const query = this.OrderRepository.createQueryBuilder('order');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (delivery_schedule_at) {
      // If you want exact date match (ignoring time), adjust as needed
      query.andWhere('DATE(order.delivery_schedule_at) = :deliveryDate', {
        deliveryDate: delivery_schedule_at.toISOString().split('T')[0],
      });
    }

    query.leftJoinAndSelect('order.user', 'user');
    query.leftJoinAndSelect('order.driver', 'driver');

    return await query.getMany();
  }
  async validateProducts(productIds: number[]): Promise<Product[]> {
    // Fetch all matching products from DB- the join table order_items
    const products = await this.productRepository.findBy({
      id: In(productIds),
    });

    // Ensure all products exist
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Missing products: ${missingIds.join(', ')}`);
    }

    // Ensure all products are available
    const unavailable = products.filter(
      (p) => !p.is_available || (p.stock !== undefined && p.stock <= 0),
    );

    if (unavailable.length > 0) {
      const names = unavailable.map((p) => p.product_name || `ID: ${p.id}`);
      throw new BadRequestException(
        `Unavailable products: ${names.join(', ')}`,
      );
    }

    return products;
  }
  async decrementStock(
    orderItems: { id: number; quantity: number }[],
  ): Promise<void> {
    for (const item of orderItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.id} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ID ${item.id}`,
        );
      }

      product.stock -= item.quantity;

      await this.productRepository.save(product); // Persist the updated stock
    }
  }
}
