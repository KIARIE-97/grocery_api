import { Product } from "src/products/entities/product.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'text'})
    category_name: string

    @ManyToMany(() => Product, (product) => product.categorys, {
        cascade: true
    })
    @JoinTable({name: 'item_category'})
    products: Relation<Product[]>;
}
