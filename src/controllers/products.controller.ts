import express from "express";
import { Request, Response } from "express";
import { Product } from "../entities/Product";
import { datasource } from "../config/db.config";
import axios from "axios";

const createProduct = async (req: Request, res: Response) => {
  const { productType, price, productName, quantity, image, color, material } =
    req.body;

  let errors: any = {};

  if (!productType) errors.name = " Type must not be empty";
  if (!productName) errors.description = "Product name must not be empty";
  if (!price) errors.status = "Price must not be empty";
  if (!quantity) errors.status = "Quantity must not be empty";
  if (!color) errors.status = "Color must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  try {
    const product = Product.create({
      productType: productType,
      productName: productName,
      price: price,
      quantity: quantity,
      image: image,
      color: color,
      material: material,
    });
    return res.json(await product.save());
  } catch (err) {
    console.error("Error while trying to save the product!!");
    return res.status(500).json(err);
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { productType, nrOfProducts, pageNumber } = req.query;

    let products;
    const skippedProducts = (Number(pageNumber) - 1) * Number(nrOfProducts);
    if (productType) {
      products = await datasource
        .getRepository(Product)
        .createQueryBuilder("product")
        .where("product.productType = :productType", {
          productType: productType,
        })
        .skip(skippedProducts)
        .take(Number(nrOfProducts))
        .getMany();
    } else {
      products = await datasource
        .getRepository(Product)
        .createQueryBuilder("product")
        .skip(skippedProducts)
        .take(Number(nrOfProducts))
        .getMany();
    }

    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Ahh...Something went wrong" });
  }
};

const getAllInStockProducts = async (req: Request, res: Response) => {
  try {
    const { nrOfProducts, pageNumber } = req.query;
    let products;
    const skippedProducts = (Number(pageNumber) - 1) * Number(nrOfProducts);
    products = await datasource
      .getRepository(Product)
      .createQueryBuilder("product")
      .where("product.quantity > :quantity", {
        quantity: 0,
      })
      .skip(skippedProducts)
      .take(Number(nrOfProducts))
      .getMany();
    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Ahh...Something went wrong" });
  }
};

const getRandomProducts = async (req: Request, res: Response) => {
  try {
    const products = await datasource
      .getRepository(Product)
      .createQueryBuilder("product")
      .select()
      .orderBy("RANDOM()")
      .take(4)
      .getMany();
    return res.status(200).json(products);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Ahh...Something went wrong at getting products" });
  }
};

const getSortedProducts = async (req: Request, res: Response) => {
  try {
    const {
      sortBy,
      sortOrder,
      nrOfProducts,
      pageNumber,
      productType,
      color,
      material,
    } = req.query;
    const skippedProducts = (Number(pageNumber) - 1) * Number(nrOfProducts);

    if (sortOrder === "desc" && sortBy === "name") {
      const productsQueryBuilder = datasource
        .getRepository(Product)
        .createQueryBuilder("product")
        .orderBy("product.productName", "DESC")
        .skip(skippedProducts)
        .take(Number(nrOfProducts));

      if (productType) {
        productsQueryBuilder.where("product.productType = :productType", {
          productType: productType,
        });
      }
      console.log(color);
      if (color) {
        productsQueryBuilder.andWhere("product.color = :color", {
          color: color,
        });
      }
      if (material) {
        productsQueryBuilder.andWhere("product.material = :material", {
          material: material,
        });
      }

      const products = await productsQueryBuilder.getMany();
      return res.status(200).json(products);
    }

    if (sortOrder === "asc" && sortBy === "name") {
      const productsQueryBuilder = datasource
        .getRepository(Product)
        .createQueryBuilder("product")
        .orderBy("product.productName", "ASC")
        .skip(skippedProducts)
        .take(Number(nrOfProducts));

      if (productType) {
        productsQueryBuilder.where("product.productType = :productType", {
          productType: productType,
        });
      }

      if (color) {
        productsQueryBuilder.andWhere("product.color = :color", {
          color: color,
        });
      }

      if (material) {
        productsQueryBuilder.andWhere("product.material = :material", {
          material: material,
        });
      }
      const products = await productsQueryBuilder.getMany();
      return res.status(200).json(products);
    }
    return res.status(400).json({ error: "Invalid sortBy or sortOrder value" });
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong for sorting" });
  }
};

const getFilteredProducts = async (req: Request, res: Response) => {
  try {
    const { price, color, material, nrOfProducts, pageNumber, productType } =
      req.query as {
        price?: number;
        color?: string;
        material?: string;
        nrOfProducts?: string;
        pageNumber?: string;
        productType?: string;
      };

    const skippedProducts = (Number(pageNumber) - 1) * Number(nrOfProducts);
    const queryBuilder = await datasource
      .getRepository(Product)
      .createQueryBuilder("product");

    if (price) {
      queryBuilder.where("product.price <= :price", { price });
    }

    if (color) {
      queryBuilder.andWhere("product.color = :color", { color });
      queryBuilder.andWhere("product.color IS NOT NULL");
    }

    if (material) {
      queryBuilder.andWhere("product.material = :material", { material });
      queryBuilder.andWhere("product.material IS NOT NULL");
    }

    if (productType) {
      queryBuilder.andWhere("product.productType = :productType", {
        productType: productType,
      });
    }

    if (nrOfProducts && pageNumber) {
      queryBuilder.skip(skippedProducts).take(Number(nrOfProducts));
    }

    const products = await queryBuilder.getMany();

    return res.json(products);
  } catch (error) {
    return res.status(400).json({
      error: "Ahh...Something went wrong with filtering the products",
    });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { productName, productType, price, quantity, image, color, material } =
    req.body;

  try {
    const product = await Product.findOneBy({ id });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update fields
    product.productName = productName ?? product.productName;
    product.productType = productType ?? product.productType;
    product.price = price ?? product.price;
    product.quantity = quantity ?? product.quantity;
    product.image = image ?? product.image;
    product.color = color ?? product.color;
    product.material = material ?? product.material;

    await product.save();

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log("Deleting product with ID:", id);
    // Find the product by ID
    const product = await Product.findOneBy({ id });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.remove(product);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: "Failed to delete product" });
  }
};

export const syncFromMaster = async (req: Request, res: Response) => {
  try {
    const { data: products } = await axios.get(
      "http://localhost:8080/api/getAllProducts",
      {
        params: { pageNumber: 1, nrOfProducts: 10000 }, // adjust if needed
      }
    );

    const repo = datasource.getRepository(Product);
    let inserted = 0;

    for (const product of products) {
      const existing = await repo.findOneBy({ id: product.id });
      if (!existing) {
        await repo.save(product);
        inserted++;
      }
    }

    return res
      .status(200)
      .json({ message: `Sync complete. Added ${inserted} new product(s).` });
  } catch (error) {
    console.error("Sync from master failed", error);
    return res.status(500).json({ error: "Sync failed" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllInStockProducts,
  getRandomProducts,
  getFilteredProducts,
  getSortedProducts,
  updateProduct,
  deleteProduct,
  syncFromMaster,
};
