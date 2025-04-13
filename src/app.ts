import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./Book/BookRouter";


const app = express();

app.use(express.json());
// Routes

// HTTP methods
app.get("/", (req, res) => {

    // const error = createHttpError(400, "Something went wrong");
    // throw error

    res.send("hello, I am dipanshu kumar -- this is Express js")
});

app.use("/api/users", userRouter)
app.use("/api/books", bookRouter)

app.use(globalErrorHandler);

export default app;