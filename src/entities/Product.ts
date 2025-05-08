import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { CartProduct } from "./CartProduct";
import { Review } from "./Review";


@Entity("products")
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  productType: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
  })
  price: number;

  @Column({ unique: true })
  productName: string;

  @Column({ unique: false })
  quantity: number;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: "enum",
    enum: ["black", "white", "cream", "green", "pink", "grey", "brown"],
    nullable: true,
  })
  color: string;

  @Column({
    type: "enum",
    enum: ["metal", "wood", "plywood", "plastic"],
    nullable: true,
  })
  material: string;

  @OneToMany(() => CartProduct, (cp) => cp.product)
  cartConnect: Promise<CartProduct[]>;

  @OneToMany(() => Review, (review) => review)
  review: Review[];
}
