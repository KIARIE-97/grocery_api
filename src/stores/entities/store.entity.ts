import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum SStatus{
    ACTIVE= 'active',
    INACTIVE= 'inactive',
}

@Entity()
export class Store {
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  @Column()
  store_name: string;

  @Column()
  location: string;

  @Column()
  is_verified: boolean;

  @Column({ type: 'time', nullable: true })
  opening_time: string;

  @Column({ type: 'time', nullable: true })
  closing_time: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  shop_image: string;

  @Column({type: 'enum', enum: SStatus, default: SStatus.ACTIVE})
  status: SStatus;

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



  @ManyToOne(() => User, (user) => user.id, {
    // cascade: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
    user: User;

  @OneToMany(() => Order, (order) => order.store, {
      cascade: ['insert', 'update'], // this allows the order to be created/updated/deleted with the store
      nullable: true,
    })
    orders: Order[]; 
     
   @OneToMany(() => Product, (product) => product.store, {
    cascade: ['insert', 'update'], // this allows the product to be created/updated/deleted with the store
    nullable: true,
   })
    products: Product[];
   
  @ManyToMany(() => User, (user) => user.suppliers, {
    nullable: true,
  })
  suppliers: User[];
}
