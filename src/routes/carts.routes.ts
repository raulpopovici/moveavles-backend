import express from "express";
import * as cartController from "../controllers/cart.controller";

const router = express.Router();

router.get('/api/getCart', cartController.getCart)

router.post("/api/addToCart", cartController.addToCart);

router.post("/api/showProductsInCart", cartController.showProductsInCart);

router.post("/api/calculateCartTotalSum", cartController.calculateCartTotalSum);

router.post("/api/deleteProductFromCart", cartController.deleteProductFromCart);

export { router as cartRouter };
