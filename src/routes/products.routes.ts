import express from "express";
import bcrypt from "bcrypt";
const router = express.Router();
const productsController = require("../controllers/products.controller");

router.post("/api/createProduct", productsController.createProduct);

router.get("/api/getAllProducts", productsController.getAllProducts);

router.get(
  "/api/getAllInStockProducts",
  productsController.getAllInStockProducts
);

router.get("/api/getRandomProducts", productsController.getRandomProducts);

router.get("/api/getFilteredProducts", productsController.getFilteredProducts);

router.get("/api/getSortedProducts", productsController.getSortedProducts);

router.put("/api/updateProduct/:id", productsController.updateProduct);

router.delete("/api/deleteProduct/:id", productsController.deleteProduct);

router.post("/api/syncFromMaster", productsController.syncFromMaster);

export { router as productRouter };
