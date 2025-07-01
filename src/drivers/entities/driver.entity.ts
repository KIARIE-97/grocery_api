import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class Driver {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  vehicle_info: string;

  @Column()
  is_available: boolean;

  @Column()
  current_location: string;

    @Column()
    total_earnings: number;

  @OneToOne(() => User, (user) => user.driver, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
    user: Relation <User>;
  
  @OneToMany(() => Order, (order) => order.driver, {
    cascade: ['insert', 'update'], // this allows the order to be created/updated/deleted with the driver
  nullable: true})  
  orders: Order[];
}
