// routes/informStatus.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('./index');

// ========== GET all informStatus ==========
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT inform_status_id, description FROM inform_status ORDER BY inform_status_id'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching inform_status:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== CREATE informStatus ==========
router.post('/', requireAuth, async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim() === '') {
        return res.status(400).json({ success: false, message: 'Description is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO inform_status (description)
             VALUES ($1)
             RETURNING inform_status_id, description`,
            [description.trim()]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating inform_status:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== UPDATE informStatus ==========
router.put('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { description } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid inform_status id' });
    }

    try {
        const result = await pool.query(
            `UPDATE inform_status
             SET description = COALESCE($1, description)
             WHERE inform_status_id = $2
             RETURNING inform_status_id, description`,
            [description !== undefined ? description.trim() : null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'inform_status not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating inform_status:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== DELETE informStatus ==========
router.delete('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid inform_status id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM inform_status WHERE inform_status_id = $1 RETURNING inform_status_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'inform_status not found' });
        }

        res.json({ success: true, message: 'inform_status deleted' });
    } catch (err) {
        console.error('Error deleting inform_status:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
