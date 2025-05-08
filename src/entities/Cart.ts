import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { CartProduct } from "./CartProduct";
import { Product } from "./Product";
import { User } from "./User";

@Entity("cart")
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user)
  @JoinColumn()
  user: User;

  @OneToMany(() => CartProduct, (cp) => cp.cart)
  productConnect: Promise<CartProduct[]>;
}
