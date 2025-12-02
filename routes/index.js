const path = require('path');
const express = require('express');
const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
}

module.exports.requireAuth = requireAuth;

router.get('/api/tonosis', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Tonosis API v0.1 is running...',
        time: new Date().toString(),
    });
});

router.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        return res.json({ success: true, message: 'Login successful' });
    }
    res.status(401).json({ success: false, message: 'Invalid username or password' });
});

router.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

router.get('/api/now', requireAuth, (req, res) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dayNumber = now.getDate();
    const weekdayIndex = now.getDay();
    const weekdayName = weekdayNames[weekdayIndex];
    const hour = now.getHours();
    const minute = now.getMinutes();
    const weekOfYear = getISOWeek(now);
    const { monday, sunday } = getWeekStartEnd(now);

    res.json({
        year,
        month,
        dayNumber,
        weekdayIndex,
        weekdayName,
        hour,
        minute,
        weekOfYear,
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

router.use('/api/clients', require('./clients'));
router.use('/api/rooms', require('./rooms'));
router.use('/api/trainers', require('./trainers'));
router.use('/api/kinds', require('./kinds'));
router.use('/api/hours', require('./hours'));
router.use('/api/sessions', require('./sessions'));
router.use('/api/inform-status', require('./informStatus'));
router.use('/api/session-clients', require('./sessionClients'));

const weekdayNames = [
    'Κυριακή',
    'Δευτέρα',
    'Τρίτη',
    'Τετάρτη',
    'Πέμπτη',
    'Παρασκευή',
    'Σάββατο',
];

function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
}

function getWeekStartEnd(date) {
    const dayIndexMonday0 = (date.getDay() + 6) % 7;
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(date.getDate() - dayIndexMonday0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
}

module.exports = router;
