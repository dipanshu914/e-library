import express from "express"
import { createUser, googleLogin, loginUser } from "./userController";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser)
userRouter.post("/google", googleLogin)

export default userRouter