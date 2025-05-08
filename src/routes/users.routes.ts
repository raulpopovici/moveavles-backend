import express from "express";
import bcrypt from "bcrypt";
const router = express.Router();
const usersController = require("../controllers/users.controller");

router.post("/api/createUser", usersController.register);

router.post("/api/loginUser", usersController.login);

router.post("/api/getUserDetails", usersController.getUserDetails);

router.post("/api/UpdateUserDetails", usersController.updateUserDetails);

router.post("/api/registerGoogleUser", usersController.registerWithGoogle);

router.get("/api/getAllUsers", usersController.getAllUsers);

export { router as userRouter };
