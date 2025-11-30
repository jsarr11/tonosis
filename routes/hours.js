// routes/hours.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('./index');

// GET all hours
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT hour_id, description FROM hour ORDER BY hour_id'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching hours:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE hour
router.post('/', requireAuth, async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim() === '') {
        return res.status(400).json({ success: false, message: 'Description is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO hour (description)
             VALUES ($1)
             RETURNING hour_id, description`,
            [description.trim()]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating hour:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE hour
router.put('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { description } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hour id' });
    }

    try {
        const result = await pool.query(
            `UPDATE hour
             SET description = COALESCE($1, description)
             WHERE hour_id = $2
             RETURNING hour_id, description`,
            [
                description !== undefined ? description.trim() : null,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Hour not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating hour:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE hour
router.delete('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hour id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM hour WHERE hour_id = $1 RETURNING hour_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Hour not found' });
        }

        res.json({ success: true, message: 'Hour deleted' });
    } catch (err) {
        console.error('Error deleting hour:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
