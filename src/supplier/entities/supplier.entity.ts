import { Location } from "src/location/entities/location.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.supplier, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  license_number: string;

  @OneToOne(() => Location, (location) => location.supplier,
   { onDelete: 'CASCADE' })
  @JoinColumn()
  warehouse_location: Location;

  @CreateDateColumn()
  created_at: Date;
}
