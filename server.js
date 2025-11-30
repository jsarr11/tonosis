require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// load login from .env (avoid USERNAME clash with OS)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

console.log('Loaded credentials from .env:', {
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
});

const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
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
            // secure: true, // όταν βάλεις HTTPS
            maxAge: 1000 * 60 * 60 * 24, // 24 ώρες
        },
    })
);

// helper για protected routes
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    return res.redirect('/');
}

// ---------- ROUTES ----------

// health check
app.get('/api/tonosis', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Tonosis API v0.1 is running...',
        time: new Date().toString(),
    });
});

// login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password });

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        return res.json({
            success: true,
            message: 'Login successful',
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
    });
});

// logout API
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ROOT = login (ή redirect αν ήδη logged in)
app.get('/', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect('/home');
    }
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// PROTECTED HOME (route /home)
app.get('/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// PROTECTED direct file /home.html (για να ΜΗΝ bypassάρουν)
app.get('/home.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// ---------- STATIC FILES (CSS, JS, images κλπ) ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- START SERVER ----------
app.listen(PORT, () => {
    console.log(`Tonosis CRM server running on http://localhost:${PORT}`);
});
