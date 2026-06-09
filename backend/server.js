const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Force Google DNS globally — fixes Replit querySrv ECONNREFUSED
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Standard MongoDB options used everywhere
const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 5,
    minPoolSize: 1,
    connectTimeoutMS: 15000,
    heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
    maxIdleTimeMS: 120000, // Keep idle connections for 2 minutes
};

// Track server start time for health checks
const SERVER_START_TIME = Date.now();

// Connect to MongoDB
connectDB();

// Auto-reconnect on disconnect (with throttle to prevent infinite loop)
let isReconnecting = false;
let reconnectAttempts = 0;

mongoose.connection.on('disconnected', () => {
    if (isReconnecting) return;
    isReconnecting = true;
    reconnectAttempts++;
    console.log(`⚠️ MongoDB disconnected! (attempt #${reconnectAttempts})`);
    
    // Auto-reconnect with exponential backoff
    const delay = Math.min(reconnectAttempts * 2000, 30000);
    setTimeout(async () => {
        try {
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(uri, MONGO_OPTIONS);
            console.log('✅ MongoDB auto-reconnected!');
        } catch (err) {
            console.error('❌ Auto-reconnect failed:', err.message);
        }
        isReconnecting = false;
    }, delay);
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('connected', () => {
    isReconnecting = false;
    reconnectAttempts = 0;
    console.log('✅ MongoDB connected!');
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

// Ensure Database is connected before serving API routes
app.use('/api', async (req, res, next) => {
    if (req.path === '/health') return next();

    if (mongoose.connection.readyState !== 1) {
        try {
            console.log('🔄 Reconnecting to MongoDB (middleware)...');
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(uri, MONGO_OPTIONS);
            console.log('✅ MongoDB Reconnected on demand!');
        } catch (error) {
            console.error('❌ MongoDB Reconnection Failed:', error.message);
            return res.status(503).json({ 
                message: 'Server is waking up, please retry in a few seconds.',
                retryAfter: 3
            });
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
    res.status(200).json({ 
        message: "Server is alive",
        uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000) + 's'
    });
});

// Health check — also reconnects DB if needed
app.get('/api/health', async (req, res) => {
    try {
        let dbStatus = 'Disconnected';

        if (mongoose.connection.readyState !== 1) {
            console.log('🔄 Health check: DB disconnected, reconnecting...');
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(uri, MONGO_OPTIONS);
            console.log('✅ Health check: DB Reconnected!');
        }

        if (mongoose.connection.readyState === 1) {
            dbStatus = 'Connected';
            await mongoose.connection.db.admin().ping();
        }

        res.json({ 
            status: 'OK', 
            message: 'Nizami API is running', 
            database: dbStatus,
            uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000) + 's',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Health check failed:', err.message);
        res.json({ 
            status: 'OK', 
            message: 'Nizami API is running', 
            database: 'Reconnecting',
            uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000) + 's'
        });
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

// ============================================================
// KEEP-ALIVE SYSTEM — Prevents Replit from sleeping
// ============================================================

// 1) Self-ping using the PUBLIC Replit URL (not localhost!)
//    This is the KEY fix — localhost pings don't prevent Replit sleep.
//    Replit only stays awake when external HTTP traffic comes in.
const REPLIT_URL = process.env.REPLIT_URL || process.env.REPLIT_DEV_DOMAIN;
const https = require('https');
const http = require('http');

function keepAlive() {
    // Try external URL first (this is what keeps Replit awake)
    if (REPLIT_URL) {
        const externalUrl = REPLIT_URL.startsWith('http') 
            ? REPLIT_URL 
            : `https://${REPLIT_URL}`;
        
        const client = externalUrl.startsWith('https') ? https : http;
        client.get(`${externalUrl}/api/health`, (res) => {
            console.log(`[Keep-Alive] External ping OK (${res.statusCode}) at ${new Date().toISOString()}`);
        }).on('error', (err) => {
            console.warn(`[Keep-Alive] External ping failed: ${err.message}, trying localhost...`);
            // Fallback to localhost
            localPing();
        });
    } else {
        // No external URL configured, use localhost as fallback
        localPing();
    }
}

function localPing() {
    const port = process.env.PORT || 5000;
    http.get(`http://localhost:${port}/api/health`, (res) => {
        console.log(`[Keep-Alive] Local ping OK (${res.statusCode}) at ${new Date().toISOString()}`);
    }).on('error', (err) => {
        console.error(`[Keep-Alive] Local ping failed: ${err.message}`);
    });
}

// Ping every 2 minutes (Replit sleeps after ~5 min inactivity)
setInterval(keepAlive, 2 * 60 * 1000);

// 2) MongoDB heartbeat — ping the database every 60 seconds to keep connection alive
setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
        try {
            await mongoose.connection.db.admin().ping();
            // Silent success — only log errors
        } catch (err) {
            console.warn('[DB Heartbeat] Ping failed:', err.message);
        }
    } else {
        console.log('[DB Heartbeat] Not connected, triggering reconnect...');
        try {
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(uri, MONGO_OPTIONS);
            console.log('[DB Heartbeat] Reconnected!');
        } catch (err) {
            console.error('[DB Heartbeat] Reconnect failed:', err.message);
        }
    }
}, 60 * 1000);