import { Driver } from "src/drivers/entities/driver.entity";
import { Store } from "src/stores/entities/store.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum OStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED= 'cancelled',
  FAILED= 'failed'
}
export enum paymentStatus {
  PENDING= 'pending',
  COMPLETED= 'completed',
  FAILED= 'failed',
  REFUNDED= 'refunded',
}
export enum paymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  COD = 'cash',
  WALLET= 'wallet'
}
@Entity()
export class Order {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  total_amount: number;

  @Column()
  tax_amount: number;

  @Column({ type: 'enum', enum: OStatus, default: OStatus.PENDING })
  status: OStatus;

  @Column({ type: 'enum', enum: paymentMethod, default: paymentMethod.COD })
  payment_method: paymentMethod;

  @Column({ type: 'enum', enum: paymentStatus, default: paymentStatus.PENDING })
  payment_status: paymentStatus;

  @Column('date')
  delivery_schedule_at: string;

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

  @ManyToOne(() => Driver, (driver) => driver.orders, {
    cascade: true, //this allows the driver to be created/updated/deleted with the order
    nullable: true,
    onDelete: 'SET NULL',
  })
  driver: Driver['id'];

  @ManyToOne(() => Store, (store) => store.orders, {
    cascade: true, //this allows the store to be created/updated/deleted with the order
    nullable: true,
    onDelete: 'CASCADE',
  })
  store: Store['id'];

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  customer: User['id'];

//   product_ids: number[]; // Assuming this is an array of product IDs
}
