require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

const PORT = process.env.PORT || 3000;

// ------------ MIDDLEWARE ------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sessions – 24 hours
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-secret-tonosis',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
    })
);

// ------------ ROUTES ------------
const routes = require('./routes/index');
app.use(routes);

// ------------ STATIC FILES ------------
// Serve everything in /public AFTER routes,
// so routes can protect login pages before static serving!
app.use(express.static(path.join(__dirname, 'public')));

// ------------ START SERVER ------------
app.listen(PORT, () => {
    console.log(`Tonosis CRM server running on http://localhost:${PORT}`);
});
