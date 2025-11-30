require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// load login from .env
const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

console.log('Loaded credentials from .env:', { USERNAME, PASSWORD });


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/api/tonosis', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Tonosis API v0.1 is running...',
        time: new Date().toString(),
    });
});

// ROOT = login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USERNAME && password === PASSWORD) {
        return res.json({
            success: true,
            message: 'Login successful',
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
    });
});

// HOME PAGE (dashboard)
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


// start server
app.listen(PORT, () => {
    console.log(`Tonosis CRM server running on http://localhost:${PORT}`);
});
