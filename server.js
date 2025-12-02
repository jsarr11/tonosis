require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const routes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "dev-secret-tonosis",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// Mount routes
app.use(routes);

// Serve frontend build
app.use(express.static(path.join(__dirname, "frontend/dist")));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Tonosis CRM server running on http://localhost:${PORT}`);
});
