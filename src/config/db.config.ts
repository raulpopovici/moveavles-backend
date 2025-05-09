// src/config/db.config.ts
import { Cart } from "../entities/Cart";
import { CartProduct } from "../entities/CartProduct";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import { Review } from "../entities/Review";
import { User } from "../entities/User";
import { DataSource } from "typeorm";

const region = process.env.REGION ?? "EU";

const dbConfigs = {
  EU: {
    host: "localhost",
    port: 5432,
    database: "moveables_eu",
  },
  US: {
    host: "localhost",
    port: 5433,
    database: "moveables_us",
  },
  ASIA: {
    host: "localhost",
    port: 5434,
    database: "moveables_asia",
  },
} as const;

const currentConfig = dbConfigs[region as keyof typeof dbConfigs];

if (!currentConfig) {
  throw new Error(`Invalid REGION: ${region}. Supported values: EU, US, ASIA`);
}

console.log(`[${region}] Connecting to DB: ${currentConfig.database}`);

export const datasource = new DataSource({
  type: "postgres",
  host: currentConfig.host,
  port: currentConfig.port,
  username: "postgres",
  password: "1234",
  database: currentConfig.database,
  entities: [User, Product, Cart, CartProduct, Order, Review],
  synchronize: true,
});
