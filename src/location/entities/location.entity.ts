import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export type OwnerType = 'user' | 'store' | 'driver' | 'order';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('increment')
  id: number;

  //   @ManyToOne(() => User, (user) => user.addresses, {
  //     onDelete: 'CASCADE',
  //     nullable: true,
  //   })
  //   user: User;
  @Column()
  ownerId: string;

  @Column({ type: 'enum', enum: ['user', 'store', 'driver'] })
  ownerType: OwnerType;

  @Column()
  label: string; // e.g. "Home", "Work"

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ default: false })
  isDefault: boolean;

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

  @OneToMany(() => Order, (order) => order.delivery_address, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  orders: Order[];
}
