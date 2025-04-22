import { NextFunction, raw, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs"
import createHttpError from "http-errors";
import bookModel from "./bookModel";


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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.log("userId: ", req.userId);


        // Create a Model in db
        const newBook = await bookModel.create({
            title,
            genre,
            author: "67f68fa4d7077a8b43253fc9",
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
        res.status(201).json({ message: "Create 200", newBook })

    } catch (error) {
        console.error("Upload or DB error : ", error)
        return next(createHttpError(500, "Error while uploading cloundinary files."))
    }
}

export default createBook;