import { Request, Response } from "express";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import { isEmpty } from "class-validator";
import { datasource } from "../index";
import { Cart } from "../entities/Cart";

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const register = async (req: Request, res: Response, next: any) => {
  const { firstName, lastName, email, password, phoneNumber, address } =
    req.body;

  let isEmailAvailable: User | null;

  isEmailAvailable = await User.findOne({
    where: { email: email },
  });

  let errors: any = {};
  if (isEmailAvailable) errors.email = "Email already exists";

  if (validateEmail(email) === false) {
    errors.email = "Please pick a valid email!";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashPassword,
      phoneNumber: phoneNumber,
      address: address,
    });

    await user.save();

    const cart = Cart.create({
      user: user,
    });

    await cart.save();

    user.cartId = cart.id;
    return res.json(user);
  } catch (err) {
    console.error("Error while trying to save the user!!");
    return res.status(500).json(err);
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    let errors: any = {};

    if (isEmpty(email) || isEmpty(password)) {
      return res.status(400).json("Email/password must not be empty!");
    }

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      errors.text = "This Username does not exist!";
      return res.status(400).json(errors);
    }
    let cart;
    cart = await datasource
      .getRepository(Cart)
      .createQueryBuilder("cart")
      .where("cart.userId = :userId", {
        userId: user.id,
      })
      .getOne();

    user.cartId = cart.id;
    if (user) {
      const hashedPassword = await bcrypt.compare(password, user.password);

      if (!hashedPassword) {
        errors.text = "Invalid Password";
        return res.status(401).json(errors);
      }

      return res.json(user);
    }
    return res.status(500).json("error");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const getUserDetails = async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ where: { id: userId } });
    return res.json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const updateUserDetails = async (req: Request, res: Response) => {
  const { id, firstName, lastName, phoneNumber, address } = req.body;

  try {
    let user = await datasource.getRepository(User).findOne({
      where: { id: id },
    });
    if (user !== null) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.phoneNumber = phoneNumber;
      user.address = address;
      await datasource.getRepository(User).save(user);
    } else {
      return res.status(500).json("errro trying to update user details");
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};
const registerWithGoogle = async (req: Request, res: Response) => {
  const { email, firstName, lastName, isGoogleUser } = req.body;

  let isEmailAvailable: User | null;

  isEmailAvailable = await User.findOne({
    where: { email: email },
  });

  if (isEmailAvailable) {
    return res.json(isEmailAvailable);
  }

  let errors: any = {};
  if (isEmailAvailable) errors.email = "Email already exists";

  if (validateEmail(email) === false) {
    errors.email = "Please pick a valid email!";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  try {
    const randomPassword = Math.random().toString(36).substring(7);

    const user = User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: randomPassword,
      isGoogleUser: isGoogleUser,
    });

    await user.save();

    const cart = Cart.create({
      user: user,
    });

    await cart.save();

    user.cartId = cart.id;
    return res.json(user);
  } catch (err) {
    console.error("Error while trying to register with Google!!");
    return res.status(500).json(err);
  }
};

const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    console.error("Failed to get users");
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getUserDetails,
  updateUserDetails,
  registerWithGoogle,
  getAllUsers,
};
