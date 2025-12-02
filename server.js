import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/ping-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
