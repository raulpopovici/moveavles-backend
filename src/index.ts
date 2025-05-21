// src/index.ts
import "reflect-metadata"; // required by TypeORM
import express from "express";
import cors from "cors";
import "dotenv/config";
import * as dotenv from "dotenv";

import { datasource } from "./config/db.config";
import { userRouter } from "./routes/users.routes";
import { productRouter } from "./routes/products.routes";
import { cartRouter } from "./routes/carts.routes";
import { orderRouter } from "./routes/order.routes";
import { ReviewRouter } from "./routes/reviews.routes";
import { aiRouter } from "./routes/ai.routes";

const PORT_MAP: Record<string, number> = {
  EU: 8080,
  US: 8081,
  ASIA: 8082,
};

const REGION = process.env.REGION || "EU";
const PORT = PORT_MAP[REGION] || 8080;
dotenv.config({ path: `.env.${REGION.toLowerCase()}` });

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const main = async () => {
  try {
    await datasource.initialize();
    console.log(`[${REGION}] ✅ Connected to database`);

    app.use(userRouter);
    app.use(productRouter);
    app.use(cartRouter);
    app.use(orderRouter);
    app.use(ReviewRouter);
    app.use(aiRouter);

    app.listen(PORT, () => {
      console.log(`[${REGION}] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[${REGION}] ❌ Database connection failed:`, error);
    process.exit(1);
  }
};

main();
