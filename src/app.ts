import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";


const app = express();


// Routes

// HTTP methods
app.get("/", (req, res) => {

    // const error = createHttpError(400, "Something went wrong");
    // throw error

    res.send("hello, I am dipanshu kumar -- this is Express js")
});

app.use(globalErrorHandler);

export default app;