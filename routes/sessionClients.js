// routes/sessions.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('./index');

// GET all sessions
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT session_id,
                    room_id,
                    trainer_id,
                    kind_id,
                    hour_id,
                    date,
                    inform_status_id,
                    is_test,
                    is_done
             FROM session
             ORDER BY session_id`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE session
router.post('/', requireAuth, async (req, res) => {
    const {
        room_id,
        trainer_id,
        kind_id,
        hour_id,
        date,
        inform_status_id,
        is_test,
        is_done
    } = req.body;

    const roomId = parseInt(room_id, 10);
    const trainerId = parseInt(trainer_id, 10);
    const kindId = parseInt(kind_id, 10);
    const hourId = parseInt(hour_id, 10);

    const informStatusId =
        inform_status_id !== undefined ? parseInt(inform_status_id, 10) : null;

    if ([roomId, trainerId, kindId, hourId].some(n => Number.isNaN(n))) {
        return res.status(400).json({ success: false, message: 'room_id, trainer_id, kind_id, hour_id must be integers' });
    }

    if (!date || date.trim() === '') {
        return res.status(400).json({ success: false, message: 'date is required' });
    }

    const isTestVal =
        is_test === undefined ? 0 : (is_test === 0 || is_test === '0' ? 0 : 1);

    const isDoneVal =
        is_done === undefined ? 0 : (is_done === 0 || is_done === '0' ? 0 : 1);

    try {
        const result = await pool.query(
            `INSERT INTO session 
             (room_id, trainer_id, kind_id, hour_id, date, inform_status_id, is_test, is_done)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING session_id, room_id, trainer_id, kind_id, hour_id, date, inform_status_id, is_test, is_done`,
            [
                roomId,
                trainerId,
                kindId,
                hourId,
                date.trim(),
                informStatusId,
                isTestVal,
                isDoneVal
            ]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error creating session:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE session
router.put('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid session id' });
    }

    let {
        room_id,
        trainer_id,
        kind_id,
        hour_id,
        date,
        inform_status_id,
        is_test,
        is_done
    } = req.body;

    const roomId = room_id !== undefined ? parseInt(room_id, 10) : null;
    const trainerId = trainer_id !== undefined ? parseInt(trainer_id, 10) : null;
    const kindId = kind_id !== undefined ? parseInt(kind_id, 10) : null;
    const hourId = hour_id !== undefined ? parseInt(hour_id, 10) : null;
    const informStatusId = inform_status_id !== undefined ? parseInt(inform_status_id, 10) : null;

    if (room_id !== undefined && Number.isNaN(roomId)) return res.status(400).json({ success: false, message: 'room_id must be integer' });
    if (trainer_id !== undefined && Number.isNaN(trainerId)) return res.status(400).json({ success: false, message: 'trainer_id must be integer' });
    if (kind_id !== undefined && Number.isNaN(kindId)) return res.status(400).json({ success: false, message: 'kind_id must be integer' });
    if (hour_id !== undefined && Number.isNaN(hourId)) return res.status(400).json({ success: false, message: 'hour_id must be integer' });
    if (inform_status_id !== undefined && Number.isNaN(informStatusId)) return res.status(400).json({ success: false, message: 'inform_status_id must be integer' });

    const isTestVal =
        is_test === undefined ? null : (is_test === 0 || is_test === '0' ? 0 : 1);

    const isDoneVal =
        is_done === undefined ? null : (is_done === 0 || is_done === '0' ? 0 : 1);

    try {
        const result = await pool.query(
            `UPDATE session
             SET room_id          = COALESCE($1, room_id),
                 trainer_id       = COALESCE($2, trainer_id),
                 kind_id          = COALESCE($3, kind_id),
                 hour_id          = COALESCE($4, hour_id),
                 date             = COALESCE($5, date),
                 inform_status_id = COALESCE($6, inform_status_id),
                 is_test          = COALESCE($7, is_test),
                 is_done          = COALESCE($8, is_done)
             WHERE session_id = $9
             RETURNING session_id, room_id, trainer_id, kind_id, hour_id, date, inform_status_id, is_test, is_done`,
            [
                roomId,
                trainerId,
                kindId,
                hourId,
                date !== undefined ? date.trim() : null,
                informStatusId,
                isTestVal,
                isDoneVal,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error updating session:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE session
router.delete('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid session id' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM session WHERE session_id = $1 RETURNING session_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.json({ success: true, message: 'Session deleted' });
    } catch (err) {
        console.error('Error deleting session:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
