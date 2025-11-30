require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// start server
app.listen(PORT, () => {
    console.log('Tonosis CRM server running on http://localhost:${PORT}');
});