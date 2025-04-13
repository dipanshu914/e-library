import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { config } from "../config/config";
import { User } from "./userTypes";

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
    try {
        const user = await userModel.findOne({ email });

        if (user) {
            const error = createHttpError(400, "User already exists with this email");
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, "Error While getting user"))
    }

    //password --> hash
    const hashPassword = await bcrypt.hash(password, 10);

    // Store in db

    let newUser: User
    try {
        newUser = await userModel.create({
            name,
            email,
            password: hashPassword
        })
    } catch (error) {
        return next(createHttpError(500, "Error while creating user."))
    }

    try {
        // Token generation JWT
        const token = sign({ sub: newUser._id }, config.jwtSecret as string, { expiresIn: "7d" });

        // Response
        res.status(201).json({ message: "User is created", accessToken: token })
    } catch (error) {
        return next(createHttpError(500, "Error while signing the jwt token"))
    }

}


// Login Function Start Here
const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // 1st get the data.
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createHttpError(400, "All fields are require"))
    };

    let user;
    try {
        // 2nd check the user is present in db or not.
        user = await userModel.findOne({ email });
        // validation.
        if (!user) {
            return next(createHttpError(404, "User not found"))
        };

    } catch (error) {
        return next(createHttpError(500, "Error in db while fetching User data"))
    };



    // 3rd - Compare password
    let isMatch
    try {
        isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return next(createHttpError(400, "Username or password is incorrect"))
        };

    } catch (error) {
        return next(createHttpError(500, "Error comparing password"))
    };

    //4th - password match create asscess token
    try {
        const token = sign({ sub: user._id }, config.jwtSecret as string, {
            expiresIn: "7d"
        });

        // Send Response
        res.status(200).json({
            message: "OK",
            accessToken: token
        })

    } catch (error) {
        return next(createHttpError(500, "Error generating JWT token"))
    }

}


export { createUser, loginUser };