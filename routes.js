const path = require('path');
const express = require('express');
const router = express.Router();

// Load admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// AUTH middleware (server-side session)
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    return res.redirect('/');
}

// ========================
//        API ROUTES
// ========================

// Health check
router.get('/api/tonosis', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Tonosis API v0.1 is running...',
        time: new Date().toString(),
    });
});

// Login
router.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        return res.json({ success: true, message: 'Login successful' });
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
    });
});

// Logout
router.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ========================
//       PAGE ROUTES
// ========================

// Root → login page
router.get('/', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect('/home');
    }
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// /home protected
router.get('/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Protect /home.html direct access
router.get('/home.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

module.exports = router;
