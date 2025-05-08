import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { IsEmail, Length } from "class-validator";
import { Order } from "./Order";
import { Review } from "./Review";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @IsEmail(undefined, { message: "Must be a valid email" })
  @Length(1, 255, { message: "Must not be empty" })
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isGoogleUser: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;
  cartId: any;

  @OneToMany(() => Order, (order) => order)
  order: Order[];

  @OneToMany(() => Review, (review) => review)
  reviews: Review[];
}
