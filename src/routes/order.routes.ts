import express from "express";
import bcrypt from 'bcrypt'
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/api/createOrder", orderController.createOrder);

router.get("/api/getOrders", orderController.getOrders);

export { router as orderRouter };
