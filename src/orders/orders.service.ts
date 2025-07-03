import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { In, Repository } from 'typeorm';
import { Order, OStatus, paymentStatus } from './entities/order.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Product } from 'src/products/entities/product.entity';

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
  ) {}
  //   async create(createOrderDto: CreateOrderDto): Promise<Order> {
  //     // Step 1: Validate Customer
  //     const customer = await this.userRepository.findOne({
  //       where: { id: createOrderDto.customer_id },
  //     });
  //     if (!customer || customer.role !== Role.CUSTOMER) {
  //       throw new NotFoundException(
  //         `Customer with id ${createOrderDto.customer_id} not found or is not a customer🥱`,
  //       );
  //     }

  //     // Step 2: Optional - Validate Store
  //     let store: Store | null = null;
  //     if (createOrderDto.store_id) {
  //       store = await this.storeRepository.findOne({
  //         where: { id: createOrderDto.store_id },
  //       });
  //       if (!store) {
  //         throw new NotFoundException(
  //           `Store with id ${createOrderDto.store_id} not found`,
  //         );
  //       }
  //     }

  //     // Step 3: Optional - Validate Driver
  //     let driver: Driver | null = null;
  //     if (createOrderDto.driver_id) {
  //       driver = await this.driverRepository.findOne({
  //         where: { id: createOrderDto.driver_id },
  //         relations: ['user'],
  //       });
  //       if (!driver || driver.user.role !== Role.DRIVER) {
  //         throw new NotFoundException(
  //           `Driver with id ${createOrderDto.driver_id} not found or is not a driver🥱`,
  //         );
  //       }
  //     }

  //     // Step 4: Determine Order Status
  //     let status: OStatus  = OStatus.PENDING; // default
  //     if (store) status = OStatus.ACCEPTED; // when a store is assigned
  //     if (store && !driver) status = OStatus.READY_FOR_PICKUP; // ready for pickup by driver
  //     if (store && driver) status = OStatus.OUT_FOR_DELIVERY; // driver is assigned

  //     // Step 5: Create and Save Order
  // const deliveryDate = new Date(createOrderDto.delivery_schedule_at);
  // const deliveryDateString = deliveryDate.toISOString().split('T')[0];
  //     if (isNaN(deliveryDate.getTime())) {
  //       throw new BadRequestException('Invalid delivery schedule date');
  //     }

  //     const newOrder = this.OrderRepository.create({
  //       total_amount: createOrderDto.total_amount,
  //       tax_amount: createOrderDto.tax_amount,
  //       status,
  //       payment_method: createOrderDto.payment_method,
  //       payment_status: createOrderDto.payment_status,
  //       delivery_schedule_at: deliveryDateString,
  //       driver: driver ? driver.id : undefined,
  //       customer: customer.id,
  //       store: store ? store.id : undefined,
  //     });

  //     return await this.OrderRepository.save(newOrder);
  //   }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const customer = await this.userRepository.findOne({
      where: { id: createOrderDto.customer_id },
    });

    if (!customer || customer.role !== 'customer') {
      throw new NotFoundException('Invalid customer');
    }

    // 1. Validate product IDs
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
      status: OStatus.ACCEPTED,
      payment_method: createOrderDto.payment_method,
      payment_status: createOrderDto.payment_status,
      delivery_schedule_at: deliveryDateString,
      customer,
      products,
    });

    const order = await this.OrderRepository.save(newOrder);

    if (order.payment_status === paymentStatus.COMPLETED) {
      await this.decrementStock(createOrderDto.product_ids);
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

  async assignDriver(orderId: number, driverId: number): Promise<Order> {
    const order = await this.OrderRepository.findOne({
      where: { id: orderId },
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

    ((order.driver = driver.id), { ...driver });
    order.status = OStatus.OUT_FOR_DELIVERY;
    return await this.OrderRepository.save(order);
  }
  async findAll() {
    return this.OrderRepository.find();
  }

  async findOne(id: number) {
    return await this.OrderRepository.findOne({
      where: { id },
      relations: ['user', 'driver'],
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

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // Convert delivery_schedule_at to ISO string if it's a number
    let updateData: any = { ...updateOrderDto };
    if (typeof updateOrderDto.delivery_schedule_at === 'number') {
      const date = new Date(updateOrderDto.delivery_schedule_at);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid delivery schedule date');
      }
      updateData.delivery_schedule_at = date.toISOString().split('T')[0];
    }
    await this.OrderRepository.update(id, updateData);
    return await this.findOne(id);
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
    if (isDriver && (!order.driver || order.driver !== currentUser.id)) {
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
