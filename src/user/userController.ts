import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { config } from "../config/config";
import { User } from "./userTypes";
import { oauth2Client } from "../config/outh2client";
import axios from "axios";
import { randomBytes } from "node:crypto";

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

        // ❗ Check if user is a Google user
        if (user.authProvider === "google") {
            return next(createHttpError(400, "You signed up using Google. Please click 'Login with Google'."))
        }

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

//Login with google
const googleLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { code } = req.query;

    if (!code || typeof code !== "string") {
        return next(createHttpError(500, "Code not provided or invalid"))
    }

    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );

        let user = await userModel.findOne({ email: userRes.data.email });
        const randomPassword = randomBytes(32).toString("hex");

        if (!user) {
            user = await userModel.create({
                name: userRes.data.name,
                email: userRes.data.email,
                password: randomPassword,
                authProvider: "google",
                googleId: userRes.data.id,
                image: userRes.data.picture
            })
        }

        // Sign a Token
        const id = user._id;
        const token = sign({ id }, config.jwtSecret as string, { expiresIn: "7d" });

        // create & send a token
        const cookieOptions = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  //7days
            httpOnly: true,
            secure: config.env === "production",
            sameSite: "lax" as const,
        }

        //set cookies
        res.cookie("jwt", token, cookieOptions);

        // remove sensitive fields from res body
        const userObj = user.toObject();
        const { password, ...userWithoutPassword } = userObj;

        res.status(200).json({
            message: "Success",
            accesstoken: token,
            user: userWithoutPassword,
        })
    } catch (error) {
        console.log("Console error : ", error)
        return next(createHttpError(500, `Error while google login ${error}`))
    }
}

export { createUser, loginUser, googleLogin };