const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

// Auto-reconnect on disconnect
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected! Attempting reconnect...');
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    }).catch(err => console.error('Auto-reconnect failed:', err.message));
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

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

// Ensure Database is connected before serving API routes (Fix for idle drop)
app.use('/api', async (req, res, next) => {
    // Skip health check from this middleware (health has its own reconnect)
    if (req.path === '/health') return next();

    if (mongoose.connection.readyState !== 1) {
        try {
            console.log('🔄 Reconnecting to MongoDB (middleware)...');
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ MongoDB Reconnected on demand!');
        } catch (error) {
            console.error('❌ MongoDB Reconnection Failed:', error.message);
            return res.status(503).json({ message: 'Server is waking up, please retry in a few seconds.' });
        }
    }
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/banners', require('./routes/banners'));

app.get('/', (req, res) => {
    res.status(200).json({ message: "Server is alive" });
});

// Health check — also reconnects DB if needed
app.get('/api/health', async (req, res) => {
    try {
        let dbStatus = 'Disconnected';

        if (mongoose.connection.readyState !== 1) {
            // DB is not connected — try to reconnect
            console.log('🔄 Health check: DB disconnected, reconnecting...');
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ Health check: DB Reconnected!');
        }

        if (mongoose.connection.readyState === 1) {
            dbStatus = 'Connected';
            // Ping DB to keep the MongoDB connection alive!
            await mongoose.connection.db.admin().ping();
        }

        res.json({ status: 'OK', message: 'Nizami API is running', database: dbStatus });
    } catch (err) {
        console.error('Health check failed:', err.message);
        res.json({ status: 'OK', message: 'Nizami API is running', database: 'Reconnecting' });
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

// Auto-ping every 4 minutes to keep server AND database alive
setInterval(() => {
    const port = process.env.PORT || 5000;
    const url = `http://localhost:${port}`;

    const http = require('http');
    http.get(`${url}/api/health`, (res) => {
        if (res.statusCode === 200) {
            console.log(`[Keep-Alive] Ping OK at ${new Date().toISOString()}`);
        } else {
            console.log(`[Keep-Alive] Ping status: ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.error(`[Keep-Alive] Ping failed: ${err.message}`);
    });
}, 4 * 60 * 1000); // Every 4 minutes (Replit sleeps after 5 min inactivity)