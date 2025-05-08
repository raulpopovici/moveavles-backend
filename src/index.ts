import { DataSource } from "typeorm";
require("dotenv").config({ path: "./env" });
import { User } from "./entities/User";
import { Product } from "./entities/Product";
import { Order } from "./entities/Order";
import express from "express";
import { userRouter } from "./routes/users.routes";
import { productRouter } from "./routes/products.routes";
import { cartRouter } from "./routes/carts.routes";
import { Cart } from "./entities/Cart";
import { CartProduct } from "./entities/CartProduct";
import { orderRouter } from "./routes/order.routes";
import { Review } from "./entities/Review";
import { ReviewRouter } from "./routes/reviews.routes";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // allow requests from frontend
    credentials: true, // if you're using cookies later
  })
);

export const datasource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1234",
  database: "moveables",
  entities: [User, Product, Cart, CartProduct, Order, Review],
  synchronize: true,
});

const main = async () => {
  try {
    let connection = await datasource.initialize();
    console.log("Conntected to database");

    app.use(express.json());
    app.use(userRouter);
    app.use(productRouter);
    app.use(cartRouter);
    app.use(orderRouter);
    app.use(ReviewRouter);
    app.listen(8080, () => {
      console.log("Now running on port 8080");
    });
  } catch (error) {
    console.error(error);
    throw new Error("Unable to connect to db");
  }
};

main();
