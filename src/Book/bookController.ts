import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs, { rmSync } from "node:fs"
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";
import mongoose from "mongoose";


const createBook = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { title, genre } = req.body;

    if (!title || !genre) {
        return next(createHttpError(400, "title and genre are required."))
    }

    // console.log("files", req.files);
    // TypeScript typesCast
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.coverImage?.[0] || !files.file?.[0]) {
        return next(createHttpError(400, "Cover image and book file are required."))
    }

    // format of img
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName)


    // // Upload on cloundinary
    try {
        const uploadResult = await cloudinary.uploader.upload(
            filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        //     // PDF upload
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath, {
            resource_type: "raw",
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf",
        });


        const _req = req as AuthRequest;

        // Create a Model in db
        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        })

        // Delete local files {only after all above success}
        try {
            await fs.promises.unlink(filePath);
            await fs.promises.unlink(bookFilePath);

        } catch (deletionError) {
            console.error("file deletion failed : ", deletionError)
            // don't fail the whole request because of failed cleanup
        }


        // return a success response
        res.status(201).json({ message: "Create 200", id: newBook._id })

    } catch (error) {
        console.error("Upload or DB error : ", error)
        return next(createHttpError(500, "Error while uploading cloundinary files."))
    }
};

// Update Book 
const updateBook = async (req: Request, res: Response, next: NextFunction) => {

    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book not found"))
    }

    // check Access
    const _req = req as AuthRequest;
    if (book.author.toString() != _req.userId) {
        return next(createHttpError(403, "unautherization"));
    };

    // check if image field exists.
    // TypeScript typesCast
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let completeCoverImage = "";

    if (files.coverImage) {
        const fileName = files.coverImage[0].filename;
        const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);

        // send files to cloundinary;
        const filePath = path.resolve(__dirname,
            "../../public/data/uploads",
            fileName);

        completeCoverImage = fileName;
        const uploadResult = await cloudinary.uploader.upload(
            filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: coverMimeType,
        });


        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    };


    // Check if file field is exists.
    let completeFileName = "";
    if (files.file) {
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);

        completeFileName = bookFileName;
        const bookfileUpload = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: completeFileName,
            folder: "book-pdfs",
            format: "pdf",
        });

        completeFileName = bookfileUpload.secure_url;
        await fs.promises.unlink(bookFilePath);
    };

    const updatedBook = await bookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            genre: genre,
            coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
            file: completeFileName ? completeFileName : book.file,
        },
        {
            new: true
        }
    )

    res.json({
        message: "book updated",
        updatedBook
    });

};

// Get a list of books
const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // add pagination.
        const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
        const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 10;

        const startIndex = (page - 1) * limit;
        const total = await bookModel.countDocuments();
        const books = await bookModel.find()
            .skip(startIndex)
            .limit(limit);

        res.json(
            {
                message: "List Books",
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                data: books.length ? books : [],
            });
    }
    catch (error) {
        return next(createHttpError(500, "Error while gettings books"))
    }
}

// Get single book
const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {

    const bookId = req.params.bookId;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return next(createHttpError(404, "Invalid bookId"))
    }

    try {
        const book = await bookModel.findOne({ _id: bookId });
        if (!book) {
            return next(createHttpError(404, "Book not found"))
        };

        res.json({
            message: "Single book",
            book
        })
    } catch (error) {
        return next(createHttpError(500, "Erro While getting single book"))
    }
}

export { createBook, updateBook, listBooks, getSingleBook };