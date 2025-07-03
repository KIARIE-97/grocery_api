import { Category } from "src/category/entities/category.entity";
import { Order } from "src/orders/entities/order.entity";
import { Store } from "src/stores/entities/store.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  store_id: number;

  @Column()
  product_name: string;

  @Column()
  product_description: string;

  @Column()
  product_price: number;

  @Column()
  product_image: string;

  @Column()
  quatity: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  size: string;

  @Column()
  is_available: boolean;

  @Column()
  image_url: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({ type: 'timestamp' })
  deleted_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => Store, (store) => store.products, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  store: Store;

  @ManyToMany(() => Order, (order) => order.products, {
    cascade: true,
  })
  @JoinTable({ name: 'order_items' })
  orders: Relation<Order[]>;

  @ManyToMany(() => Category, (category) => category.products)
  categorys: Relation<Category[]>;

}
