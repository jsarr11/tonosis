const express = require("express");
const router = express.Router();

// Middleware for protected routes
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
}
module.exports.requireAuth = requireAuth;

// Health check
router.get("/api/tonosis", (req, res) => {
    res.json({
        status: "ok",
        message: "Tonosis API v0.1 is running...",
        time: new Date().toString(),
    });
});

// Login
router.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (
        username === process.env.ADMIN_USR &&
        password === process.env.ADMIN_PSW
    ) {
        req.session.user = { username };
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Session check
router.get("/api/me", (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(401).json({ loggedIn: false });
    }
});

// Logout
router.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// Example protected route
router.get("/api/now", requireAuth, (req, res) => {
    const now = new Date();
    res.json({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
    });
});

// Mount submodules
router.use("/api/clients", require("./clients"));
router.use("/api/rooms", require("./rooms"));
router.use("/api/trainers", require("./trainers"));
router.use("/api/kinds", require("./kinds"));
router.use("/api/hours", require("./hours"));
router.use("/api/sessions", require("./sessions"));
router.use("/api/inform-status", require("./informStatus"));
router.use("/api/session-clients", require("./sessionClients"));

module.exports = router;
