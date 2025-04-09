import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { config } from "../config/config";

const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    };

    // Database Call
    const user = await userModel.findOne({ email });

    if (user) {
        const error = createHttpError(400, "User already exists with this email");
        return next(error);
    }

    //password --> hash
    const hashPassword = await bcrypt.hash(password, 10);

    // Store in db
    const newUser = await userModel.create({
        name,
        email,
        password: hashPassword
    })

    // Token generation JWT
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, { expiresIn: "7d" });

    // Response
    res.json({ message: "User is created", accessToken: token })

}


export { createUser };