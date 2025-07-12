import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  Relation,
} from 'typeorm';


export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  COD = 'cash_on_delivery',
  MPESA = 'mpesa',
  WALLET = 'wallet',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.Payments, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  user: User;

  @OneToOne(() => Order, (order) => order.payment)
  order?: Relation<Order>;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  phone_number?: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  //   @Column({ nullable: true })
  //   transactionId: string;

  //   @Column({ nullable: true })
  //   paymentProviderResponse: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
