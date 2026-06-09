const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS — fixes Replit DNS resolution failures after sleep
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

mongoose.set('bufferCommands', false);

const connectDB = async (retries = 3) => {
    for (let i = 1; i <= retries; i++) {
        try {
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 15000,
                socketTimeoutMS: 45000,
                family: 4, // Force IPv4
                maxPoolSize: 5,
                minPoolSize: 1,
                maxIdleTimeMS: 120000, // 2 minute idle time
                connectTimeoutMS: 15000,
                heartbeatFrequencyMS: 10000,
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`❌ MongoDB Connection Attempt ${i}/${retries} Failed: ${error.message}`);
            if (i < retries) {
                const delay = i * 3000; // 3s, 6s, 9s
                console.log(`   Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.log('Will retry connection on first API request.');
};

module.exports = connectDB;
