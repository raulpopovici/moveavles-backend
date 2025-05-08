import express from "express";
import { Request, Response } from "express";
import { datasource } from "../index";
import { Review } from "../entities/Review";
import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { CartProduct } from "../entities/CartProduct";
import { Cart } from "../entities/Cart";

const giveReview = async (req: Request, res: Response) => {
  const { productId, userId, firstName, rating, comment } = req.body;

  try {
    let user: User | null;
    user = await User.findOne({
      where: { id: userId },
    });

    let product: Product | null;
    product = await Product.findOne({
      where: { id: productId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with ID ${userId} not found` });
    }

    if (!product) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found` });
    }

    const cartProduct = await CartProduct.findOne({
      where: { cartId: user.cartId, productId, ordered: true },
    });

    if (!cartProduct) {
      return res
        .status(400)
        .json({ message: "User has not ordered this product" });
    }

    const existingReview = await Review.findOne({
      where: { product: { id: productId }, user: { id: userId } },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: `User has already given a review for this product` });
    }

    let review;
    review = Review.create({
      product: productId,
      user: userId,
      firstName: firstName,
      rating: rating,
      comment: comment,
    });

    return res.json(await review.save());
  } catch (err) {
    console.error("Error while trying to save the user!!");
    return res.status(500).json(err);
  }
};
const getReviews = async (req: Request, res: Response) => {
  const { productId } = req.query;
  const productIdString = String(productId);
  try {
    const reviews = await Review.find({
      where: { product: { id: productIdString } },
      relations: ["user"],
    });

    return res.json(reviews);
  } catch (err) {
    console.error("Error while trying to get the products!!!");
    return res.status(500).json(err);
  }
};

async function checkReviewEligibility(req: Request, res: Response) {
  const { userId, productId } = req.query;
  console.log(userId);
  if (!userId || !productId) {
    return res
      .status(400)
      .json({ code: 1, message: "Missing required parameters" });
  }

  try {
    const user = await datasource
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :userId", { userId })
      .getOne();

    const cart = await datasource
      .getRepository(Cart)
      .createQueryBuilder("cart")
      .where("cart.userId = :userId", { userId })
      .getOne();

    const product = await datasource
      .getRepository(Product)
      .createQueryBuilder("product")
      .where("product.id = :productId", { productId })
      .getOne();

    if (!user) {
      return res
        .status(404)
        .json({ code: 2, message: `User with ID ${userId} not found` });
    }

    if (!product) {
      return res
        .status(404)
        .json({ code: 2, message: `Product with ID ${productId} not found` });
    }

    if (!cart) {
      return res
        .status(404)
        .json({ code: 2, message: `Cart with ID ${productId} not found` });
    }

    const existingReview = await datasource
      .getRepository(Review)
      .createQueryBuilder("review")
      .where("review.user = :userId", { userId })
      .andWhere("review.product = :productId", { productId })
      .getOne();

    if (existingReview) {
      return res.json({
        code: 3,
        message: "User has already given a review for this product",
      });
    }

    const hasOrderedProduct = await datasource
      .getRepository(CartProduct)
      .createQueryBuilder("cartProduct")
      .where("cartProduct.cartId = :cartId", { cartId: cart.id })
      .andWhere("cartProduct.productId = :productId", { productId })
      .andWhere("cartProduct.ordered = true")
      .getOne();

    if (!hasOrderedProduct) {
      return res.json({
        code: 3,
        message: "User needs to order the product in order to give a review",
      });
    }

    return res.json({ code: 0, message: "User is eligible to give a review" });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return res.status(500).json({ code: 3, message: "Internal server error" });
  }
}

const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({
      relations: ["user", "product"],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

module.exports = {
  giveReview,
  getReviews,
  checkReviewEligibility,
  getAllReviews,
};
