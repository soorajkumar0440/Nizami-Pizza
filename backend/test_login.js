const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: 'admin@bitehub.com' });
        if (!user) {
            console.log('❌ User not found');
        } else {
            console.log('✅ User found:', user.email);
            const isMatch = await user.comparePassword('admin123');
            console.log('✅ Password Match:', isMatch);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
};

testLogin();
