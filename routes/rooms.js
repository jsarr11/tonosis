// routes/rooms.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('./index');

// GET all rooms
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT room_id, description, capacity FROM room ORDER BY room_id'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE room
router.post('/', requireAuth, async (req, res) => {
    const { description, capacity } = req.body;

    if (!description || description.trim() === '') {
        return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const cap = parseInt(capacity, 10);
    if (Number.isNaN(cap) || cap <= 0) {
        return res.status(400).json({ success: false, message: 'Capacity must be a positive integer' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO room (description, capacity)
             VALUES ($1, $2)
             RETURNING room_id, description, capacity`,
            [description.trim(), cap]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating room:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE room
router.put('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { description, capacity } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    const cap = capacity !== undefined ? parseInt(capacity, 10) : null;
    if (capacity !== undefined && (Number.isNaN(cap) || cap <= 0)) {
        return res.status(400).json({ success: false, message: 'Capacity must be a positive integer' });
    }

    try {
        const result = await pool.query(
            `UPDATE room
             SET description = COALESCE($1, description),
                 capacity    = COALESCE($2, capacity)
             WHERE room_id = $3
             RETURNING room_id, description, capacity`,
            [
                description !== undefined ? description.trim() : null,
                cap,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating room:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE room
router.delete('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM room WHERE room_id = $1 RETURNING room_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        res.json({ success: true, message: 'Room deleted' });
    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
