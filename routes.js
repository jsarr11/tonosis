const path = require('path');
const express = require('express');
const router = express.Router();
const pool = require('./db');

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

// ========================
//        CLIENTS
// ========================

router.get('/api/clients', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT client_id, name, details, is_active FROM client ORDER BY client_id'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/api/clients', requireAuth, async (req, res) => {
    const { name, details, is_active } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Name is required',
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO client (name, details, is_active)
             VALUES ($1, $2, COALESCE($3, 1))
             RETURNING client_id, name, details, is_active`,
            [name.trim(), details || null, is_active ?? 1]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating client:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/api/clients/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid client id' });
    }

    const { name, details, is_active } = req.body;

    const activeValue =
        is_active === undefined
            ? null
            : (is_active === 0 || is_active === '0' ? 0 : 1);

    try {
        const result = await pool.query(
            `UPDATE client
             SET
               name = COALESCE($1, name),
               details = COALESCE($2, details),
               is_active = COALESCE($3, is_active)
             WHERE client_id = $4
             RETURNING client_id, name, details, is_active`,
            [
                name !== undefined ? name.trim() : null,
                details !== undefined ? details : null,
                activeValue,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/api/clients/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid client id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM client WHERE client_id = $1 RETURNING client_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.json({ success: true, message: 'Client deleted' });
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;