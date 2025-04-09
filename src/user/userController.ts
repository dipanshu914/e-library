import { NextFunction, Request, Response } from "express";

const createUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {

    res.json({ message: "User is created" })
}


export { createUser };