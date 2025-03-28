import express from "express";

const app = express();


// Routes

// HTTP methods
app.get("/", (req, res) => {
    res.send("hello, I am dipanshu kumar -- this is Express js")
})

export default app;