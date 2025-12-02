const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("./index");

// ----- CLIENT CRUD -----

// Get all clients
router.get("/", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT client_id, name, details, is_active FROM client ORDER BY name ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Create new client
router.post("/", requireAuth, async (req, res) => {
    const { name, details, is_active } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: "Name is required" });
    }
    try {
        const result = await pool.query(
            `INSERT INTO client (name, details, is_active)
       VALUES ($1, $2, COALESCE($3, 1))
       RETURNING client_id, name, details, is_active`,
            [name.trim(), details || null, is_active ?? 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update client
router.put("/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, details, is_active } = req.body;
    const activeValue =
        is_active === undefined ? null : (is_active === 0 || is_active === "0" ? 0 : 1);

    try {
        const result = await pool.query(
            `UPDATE client
       SET name = COALESCE($1, name),
           details = COALESCE($2, details),
           is_active = COALESCE($3, is_active)
       WHERE client_id = $4
       RETURNING client_id, name, details, is_active`,
            [
                name !== undefined ? name.trim() : null,
                details !== undefined ? details : null,
                activeValue,
                id,
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Delete client
router.delete("/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const result = await pool.query(
            "DELETE FROM client WHERE client_id = $1 RETURNING client_id",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        res.json({ success: true, message: "Client deleted" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
