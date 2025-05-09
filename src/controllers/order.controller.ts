import { CartProduct } from "../entities/CartProduct";
import express from "express";
import { Request, Response } from "express";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { Cart } from "../entities/Cart";
import { datasource } from "../config/db.config";

const createOrder = async (req: Request, res: Response) => {
  const { firstName, lastName, totalSum, address, phoneNumber, userId } =
    req.body;

  try {
    let user: User | null;
    user = await User.findOne({
      where: { id: userId },
    });

    let order;
    order = Order.create({
      firstName: firstName,
      lastName: lastName,
      totalSum: totalSum,
      address: address,
      phoneNumber: phoneNumber,
      user: userId,
    });

    if (order != null) {
      let cart;
      cart = await datasource
        .getRepository(Cart)
        .createQueryBuilder("cart")
        .where("cart.userId = :userId", {
          userId: userId,
        })
        .getOne();

      console.log(cart.id);
      let cartP;
      cartP = await datasource
        .createQueryBuilder()
        .update(CartProduct)
        .set({ ordered: true })
        .where("cartId = :cartId", {
          cartId: cart?.id,
        })
        .execute();
    }

    return res.json(await order.save());
  } catch (err) {
    console.error("Error while trying to creacte an order!!");
    return res.status(500).json(err);
  }
};

const getOrders = async (req: Request, res: Response) => {
  const { userId } = req.query;

  try {
    let orders;

    if (userId) {
      const userIdString = String(userId);
      orders = await Order.find({
        where: { user: { id: userIdString } },
      });
    } else {
      // 🟢 Fetch all orders if no userId is specified
      orders = await Order.find();
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    return res.json(orders);
  } catch (err) {
    console.error("Error while trying to get the orders!!!");
    return res.status(500).json(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
};
