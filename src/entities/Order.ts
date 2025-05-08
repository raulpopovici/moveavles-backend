import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity("orders")
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  totalSum: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  phoneNumber: string;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: "userId" })
  user: Promise<User>;
}
