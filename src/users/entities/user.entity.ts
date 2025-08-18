import { Driver } from 'src/drivers/entities/driver.entity';
import { Location } from 'src/location/entities/location.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export enum Role {
  CUSTOMER = 'customer',
  STORE_OWNER = 'store_owner',
  DRIVER = 'driver',
  ADMIN = 'admin',
  SUPPLIER = 'supplier',
}

export enum UStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
  DEACTIVATED = 'deactivated',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  full_name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true, default: null })
  otp: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  hashedRefreshToken: string | null;

  @Column()
  phone_number: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ type: 'text', nullable: true, default: null })
  profile_url: string;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToOne(() => Driver, (driver) => driver.user)
  driver?: Relation<Driver>;

  @OneToMany(() => Store, (store) => store.user, {
    cascade: ['insert', 'update'], // this allows the store to be created/updated/ with the user
    nullable: true,
  })
  stores: Store[];

  @OneToMany(() => Order, (order) => order.customer, {
    cascade: ['insert', 'update'], // this allows the order to be created/updated with the user
    nullable: true,
  })
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    cascade: ['insert', 'update'], // this allows the Payment to be created/updated with the user
    nullable: true,
  })
  Payments: Payment[];

  @ManyToMany(() => Store, (store) => store.suppliers, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinTable({ name: 'user_store_suppliers' })
  suppliers: Store[];

  @OneToOne(() => Supplier, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  supplier?: Supplier;
}
