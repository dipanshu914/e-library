import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";


const app = express();


// Routes

// HTTP methods
app.get("/", (req, res) => {

    // const error = createHttpError(400, "Something went wrong");
    // throw error

    res.send("hello, I am dipanshu kumar -- this is Express js")
});

app.use("/api/users", userRouter)

app.use(globalErrorHandler);

export default app;