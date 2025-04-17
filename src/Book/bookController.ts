import { NextFunction, raw, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";


const createBook = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    // const {} = req.body;

    console.log("files", req.files);
    // TypeScript typesCast
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // format of img
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);

    // Img file name and it's path
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName)

    // Upload on cloundinary
    try {
        const uploadResult = await cloudinary.uploader.upload(
            filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        console.log("Upload files", uploadResult)


    } catch (error) {
        return next(createHttpError(500, "Error while uploading cloundinary files"))
    }

    // PDF upload
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);

    // Upload on cloundinary - PDF
    try {

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath, {
            resource_type: "raw",
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf",
        });

        console.log("Bookfile Upload files", bookFileUploadResult)


    } catch (error) {
        return next(createHttpError(500, "Error while uploading cloundinary files"))
    }



    res.json({ message: "Createbook 200" })
}

export default createBook;