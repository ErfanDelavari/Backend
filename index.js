const express = require("express");
const exerciseRouter = require("./routes/exercise");
require('dotenv').config()


const app = express();

// Uses 
app.use(express.json());
app.use(express.urlencoded({ extended: true, }));

// =========== Static Providers ========
app.use("/media", express.static('images'));
// ============ Routers ==============
// Exercise List

app.use("/exercise", exerciseRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});
app.listen(process.env.PORT, () => {
    console.log(`Example app listening at ${process.env.DOMAIN}`);
});