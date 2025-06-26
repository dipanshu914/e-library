import { Types } from "mongoose";
import { User } from "../user/userTypes";

export interface Book {
    _id: string;
    title: string;
    description: string;
    author: User;
    genre: string;
    coverImage: string;
    file: string;
    downloadCount: number;
    readCount: number;
    favorites: Types.ObjectId[]
    createdAt: Date;
    updatedAt: Date;
}