import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity()
export class CartProduct extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  productId: string;

  @Column()
  cartId: string;

  @ManyToOne(() => Product, (product) => product.cartConnect, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Promise<Product>;

  @ManyToOne(() => Cart, (cart) => cart.productConnect)
  @JoinColumn({ name: "cartId" })
  cart: Promise<Cart>;

  @Column({ unique: false })
  quantity: number;

  @Column({ unique: false, default: false })
  ordered: boolean;
}
