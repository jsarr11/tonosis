// routes/trainers.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('./index');

// GET all trainers
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT trainer_id, name, color FROM trainer ORDER BY trainer_id'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching trainers:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE trainer
router.post('/', requireAuth, async (req, res) => {
    const { name, color } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO trainer (name, color)
             VALUES ($1, $2)
             RETURNING trainer_id, name, color`,
            [name.trim(), color || null]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating trainer:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE trainer
router.put('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, color } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid trainer id' });
    }

    try {
        const result = await pool.query(
            `UPDATE trainer
             SET name  = COALESCE($1, name),
                 color = COALESCE($2, color)
             WHERE trainer_id = $3
             RETURNING trainer_id, name, color`,
            [
                name !== undefined ? name.trim() : null,
                color !== undefined ? color : null,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating trainer:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE trainer
router.delete('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid trainer id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM trainer WHERE trainer_id = $1 RETURNING trainer_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }

        res.json({ success: true, message: 'Trainer deleted' });
    } catch (err) {
        console.error('Error deleting trainer:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
