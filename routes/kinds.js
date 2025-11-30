// routes/kinds.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('./index');

// GET all kinds
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT kind_id, description FROM kind ORDER BY kind_id'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching kinds:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE kind
router.post('/', requireAuth, async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim() === '') {
        return res.status(400).json({ success: false, message: 'Description is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO kind (description)
             VALUES ($1)
             RETURNING kind_id, description`,
            [description.trim()]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating kind:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE kind
router.put('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { description } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid kind id' });
    }

    try {
        const result = await pool.query(
            `UPDATE kind
             SET description = COALESCE($1, description)
             WHERE kind_id = $2
             RETURNING kind_id, description`,
            [
                description !== undefined ? description.trim() : null,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Kind not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating kind:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE kind
router.delete('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid kind id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM kind WHERE kind_id = $1 RETURNING kind_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Kind not found' });
        }

        res.json({ success: true, message: 'Kind deleted' });
    } catch (err) {
        console.error('Error deleting kind:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
