const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://nizami-pizza.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/banners', require('./routes/banners'));

// app.get('/', (req, res) => {
//     res.send('Nizami API is working fine!');
// });

app.get('/', (req, res) => {
    res.status(200).json({ message: "Server is alive" });
});
const mongoose = require('mongoose');

// Health check
app.get('/api/health', async (req, res) => {
    try {
        let dbStatus = 'Disconnected';
        if (mongoose.connection.readyState === 1) {
            dbStatus = 'Connected';
            // Ping DB to keep the MongoDB connection alive!
            await mongoose.connection.db.admin().ping();
        }
        res.json({ status: 'OK', message: 'Nizami API is running', database: dbStatus });
    } catch (err) {
        console.error('Health check DB ping failed:', err);
        res.json({ status: 'OK', message: 'Nizami API is running', database: 'Error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\nNizami API Server running on port ${PORT}`);
    console.log(`   http://localhost:${PORT}/api/health\n`);

});
// Auto-ping to keep the server alive
setInterval(() => {
    const port = process.env.PORT || 5000;
    // Replit ka base URL dynamically lein ya hardcode karein
    const url = `http://localhost:${port}`;

    const http = require('http');
    http.get(`${url}/api/health`, (res) => {
        if (res.statusCode === 200) {
            console.log(`[Keep-Alive] Ping successful at ${new Date().toISOString()}`);
        } else {
            console.log(`[Keep-Alive] Ping returned status: ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.error(`[Keep-Alive] Ping failed: ${err.message}`);
    });
}, 10 * 60 * 1000); // 10 minute ka interval zyada behtar hai