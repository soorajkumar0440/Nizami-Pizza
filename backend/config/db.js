const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000, // Increased for cold starts
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('Will retry connection on first API request.');
    }
};

module.exports = connectDB;
