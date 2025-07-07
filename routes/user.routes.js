import express from "express";
import { getAllUsers, getProfile, login, register, updateProfile } from "../controller/user.controller.js";
import verifyToken from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post('/register',register)
userRouter.post('/login',login)
userRouter.get('/profile', verifyToken,getProfile)
userRouter.put('/profile', verifyToken, updateProfile)
userRouter.get('/all', verifyToken, getAllUsers) // For admin to get all users

export default userRouter;
