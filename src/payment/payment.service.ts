import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { ConfigService } from '@nestjs/config';
import { getAccessToken, triggerStkPush } from './utils/mpesa.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly OrderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async payWithPhoneNumber(userId: number, createPaymentDto: CreatePaymentDto) {
    // Fetch user with orders
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['orders'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.orders || user.orders.length === 0) {
      throw new Error('No orders found for user');
    }
    // Get latest order (assuming last in array is latest)
    const latestOrder = user.orders[user.orders.length - 1];
    const amount = latestOrder.total_amount;

    // Prefer phone_number argument, fallback to createPaymentDto.phone_number
    const phone_number = createPaymentDto.phone_number || undefined;
    if (!phone_number) {
      throw new Error('Phone number is required');
    }
    console.log('amount', amount, 'phone_number', phone_number);
    const MPESA_CONSUMER_KEY =
      this.configService.get<string>('MPESA_CONSUMER_KEY');
    const MPESA_CONSUMER_SECRET = this.configService.get<string>(
      'MPESA_CONSUMER_SECRET',
    );
    const MPESA_SHORTCODE = this.configService.get<string>('MPESA_SHORTCODE');
    const callbackUrl = 'https://grocerydelivery-api.onrender.com';
    const passkey = this.configService.get<string>('MPESA_PASSKEY');

    if (!MPESA_CONSUMER_KEY) {
      throw new Error('MPESA_CONSUMER_KEY is not defined in the configuration');
    }
    if (!MPESA_CONSUMER_SECRET) {
      throw new Error(
        'MPESA_CONSUMER_SECRET is not defined in the configuration',
      );
    }
    if (!MPESA_SHORTCODE) {
      throw new Error('MPESA_SHORTCODE is not defined in the configuration');
    }
    if (!passkey) {
      throw new Error('MPESA_PASSKEY is not defined in the configuration');
    }

    const accessToken = await getAccessToken(
      MPESA_CONSUMER_KEY,
      MPESA_CONSUMER_SECRET,
    );
    await triggerStkPush(
      phone_number,
      amount,
      accessToken,
      Number(MPESA_SHORTCODE),
      passkey,
      callbackUrl,
    );
    //  save payment record here

    // return {
    //   message: 'STK push initiated',
    //   amount,
    //   phone_number: phone_number,
    // };
    const newPayment = this.paymentRepository.create({
      user: user,
      order: latestOrder,
      amount: amount,
      phone_number: phone_number,
      method: PaymentMethod.MPESA,
    });
  
    // Link payment on order side
    latestOrder.payment = newPayment;
    latestOrder.payment_status = PaymentStatus.SUCCESS;
    // latestOrder.payment_method = PaymentMethod.MPESA.toString() as any;
    // console.log('Latest order before saving:', latestOrder);

    // Save order with cascade on payment relation
    const savedOrder = await this.OrderRepository.save(latestOrder);
    // console.log('Order and payment saved:', savedOrder);

   return {
     message: 'Payment initiated successfully',
     amount,
     phone_number,
     orderId: savedOrder.id,
     payment_status: savedOrder.payment_status,
   };

  }

  async findAll() {
    return this.paymentRepository.find({
      relations: ['user', 'order'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
