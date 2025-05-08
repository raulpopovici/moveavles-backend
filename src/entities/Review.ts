import {
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
  } from "typeorm";
import { Product } from "./Product";
import { User } from "./User";


@Entity("reviews")
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: [1, 2, 3, 4, 5],
    default: 3,
    nullable: false,
  })
  rating: number;

  @Column()
  comment: string;

  @Column({ nullable: true })
  firstName: string;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: "userId" })
  user: Promise<User>;

@ManyToOne(() => Product, (product) => product)
@JoinColumn({ name: "productId" })
product: Promise<Product>;
}
