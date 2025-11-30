// routes/index.js
const path = require('path');
const express = require('express');
const router = express.Router();

// Load admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// AUTH middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    return res.redirect('/');
}

module.exports.requireAuth = requireAuth;

// ========== API BASIC ==========
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

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        return res.json({ success: true, message: 'Login successful' });
    }

    res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Logout
router.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ========== PAGES ==========
router.get('/', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect('/home');
    }
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

// ========== MOUNT ROUTERS ==========
router.use('/api/clients', require('./clients'));
router.use('/api/rooms', require('./rooms'));
router.use('/api/trainers', require('./trainers'));
router.use('/api/kinds', require('./kinds'));
router.use('/api/hours', require('./hours'));
router.use('/api/sessions', require('./sessions'));
router.use('/api/inform-status', require('./informStatus'));
router.use('/api/session-clients', require('./sessionClients'));

module.exports = router;
