const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS — fixes Replit DNS resolution failures after sleep
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4 — prevents IPv6 DNS issues on Replit
            maxPoolSize: 5,
            minPoolSize: 1,
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 30000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('Will retry connection on first API request.');
    }
};

module.exports = connectDB;
