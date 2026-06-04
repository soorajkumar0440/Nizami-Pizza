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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Nizami API is running' });
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
