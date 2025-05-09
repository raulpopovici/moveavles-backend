import { CartProduct } from "../entities/CartProduct";
import express from "express";
import { Request, Response } from "express";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { DataSource } from "typeorm";
import { datasource } from "../config/db.config";

export const getCart = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await User.findOne({ where: { id: userId } });
  const cart = await Cart.findOne({ where: { user: { id: userId } } });

  if (!cart && user) {
    await Cart.create({ user: user });
  }

  const createdCart = await Cart.findOne({ where: { user: { id: userId } } });

  return res.status(201).json(createdCart);
};

export const addToCart = async (req: Request, res: Response) => {
  const { productId, cartId } = req.body;

  try {
    let productAlreadyCart = await CartProduct.findOne({
      where: { cartId: cartId, productId: productId, ordered: false },
    }); //try to see if we can find one

    let productInCart;
    if (!productAlreadyCart) {
      productInCart = CartProduct.create({
        productId: productId,
        cartId: cartId,
        quantity: 1,
      });
      await productInCart.save();
    } else {
      productInCart = await datasource
        .getRepository(CartProduct)
        .createQueryBuilder()
        .update(CartProduct)
        .set({ quantity: productAlreadyCart.quantity + 1 })
        .where("cartId = :cartId", { cartId })
        .andWhere("productId = :productId", { productId })
        .andWhere("ordered = :ordered", { ordered: false })
        .execute();
    }
    return res.json(productInCart);
  } catch (err) {
    console.error("Error while trying to save to cart!!");
    return res.status(500).json(err);
  }
};

export const showProductsInCart = async (req: Request, res: Response) => {
  const { cartId } = req.body;
  try {
    const cartProducts = await datasource.getRepository(CartProduct).find({
      relations: {
        product: true,
      },
      where: { cartId: cartId, ordered: false },
    });
    return res.status(200).json(cartProducts);
  } catch (err) {
    console.error("Error getting data from the cart!!");
    return res.status(500).json(err);
  }
};

export const calculateCartTotalSum = async (req: Request, res: Response) => {
  const { cartId } = req.body;
  try {
    const cartProducts = await datasource.getRepository(CartProduct).find({
      relations: {
        product: true,
      },
      where: { cartId: cartId, ordered: false },
    });

    let totalSum = 0;
    for (let i = 0; i < cartProducts.length; i++) {
      const { product } = cartProducts[i];
      totalSum =
        totalSum + cartProducts[i].quantity * Number((await product).price);
    }
    return res.status(200).json(totalSum.toFixed(2));
  } catch (err) {
    console.error("Error getting data from the cart!!");
    return res.status(500).json(err);
  }
};

export const deleteProductFromCart = async (req: Request, res: Response) => {
  const { productId, cartId } = req.body;

  try {
    let productAlreadyCart = await CartProduct.findOne({
      where: { productId: productId, cartId: cartId, ordered: false },
    });

    console.log(productAlreadyCart);
    if (productAlreadyCart !== null) {
      if (productAlreadyCart.quantity - 1 === 0) {
        await datasource.getRepository(CartProduct).remove(productAlreadyCart);
        return res.json("removed");
      } else {
        productAlreadyCart.quantity = productAlreadyCart.quantity - 1;
        await datasource.getRepository(CartProduct).save(productAlreadyCart);
      }
    } else {
      return res.status(500).json("error trying to delete");
    }
    return res.json(productAlreadyCart);
  } catch (err) {
    console.error("Error while trying to make cart operation!");
    return res.status(500).json(err);
  }
};
