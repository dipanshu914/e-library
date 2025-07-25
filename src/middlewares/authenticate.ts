import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
    userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")
    if (!token) {
        return next(createHttpError(401, "Authorization token is required."))
    }


    try {
        const parseToken = token?.split(" ")[1];
        const decoded = verify(parseToken, config.jwtSecret as string);
        const _req = req as AuthRequest;
        _req.userId = decoded.sub as string;
    } catch (error) {
        return next(createHttpError(401, "Token expired."))
    };

    next();
};

export default authenticate;