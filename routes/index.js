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

// Τρέχουσα ημερομηνία/ώρα + πληροφορίες εβδομάδας
router.get('/api/now', requireAuth, (req, res) => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;      // 1-12
    const dayNumber = now.getDate();       // 1-31
    const weekdayIndex = now.getDay();     // 0-6 (0=Κυριακή)
    const weekdayName = weekdayNames[weekdayIndex];

    const hour = now.getHours();
    const minute = now.getMinutes();

    const weekOfYear = getISOWeek(now);
    const { monday, sunday } = getWeekStartEnd(now);

    res.json({
        year,
        month,
        dayNumber,
        weekdayIndex,        // 0-6
        weekdayName,         // π.χ. "Παρασκευή"
        hour,
        minute,
        weekOfYear,          // αριθμός εβδομάδας στο έτος (ISO)
        weekStart: {
            day: monday.getDate(),
            month: monday.getMonth() + 1,
        },
        weekEnd: {
            day: sunday.getDate(),
            month: sunday.getMonth() + 1,
        },
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

// ========== DATE FUNCTIONS ==========
const weekdayNames = [
    'Κυριακή',
    'Δευτέρα',
    'Τρίτη',
    'Τετάρτη',
    'Πέμπτη',
    'Παρασκευή',
    'Σάββατο',
];

// ISO week (Δευτέρα πρώτη μέρα εβδομάδας)
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // 1-7, όπου 1 = Δευτέρα, 7 = Κυριακή
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
}

function getWeekStartEnd(date) {
    // κάνουμε Δευτέρα = 0, Τρίτη = 1, ..., Κυριακή = 6
    const dayIndexMonday0 = (date.getDay() + 6) % 7;

    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(date.getDate() - dayIndexMonday0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { monday, sunday };
}


module.exports = router;
