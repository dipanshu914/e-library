import express from "express"
import { createBook, updateBook, listBooks, getSingleBook, deleteBook, getUserBook } from "./bookController";

import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";


const bookRouter = express.Router();

// file store local --> cloudinary
const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: {
        fileSize: 1e7   // 10mb;
    }
})

bookRouter.post("/",
    authenticate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 }
    ]),
    createBook
);

bookRouter.patch("/:bookId",
    authenticate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 }
    ]),
    updateBook
);

bookRouter.get("/", listBooks)

//users book route
bookRouter.get("/mybook", authenticate, getUserBook)

bookRouter.get("/:bookId", getSingleBook)
bookRouter.delete("/:bookId", authenticate, deleteBook);


export default bookRouter;