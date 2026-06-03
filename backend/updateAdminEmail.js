const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitehub')
    .then(async () => {
        await User.updateOne(
            { email: 'admin@bitehub.com' },
            { $set: { email: 'admin@nizami.com' } }
        );
        console.log('Admin email updated to admin@nizami.com');
        process.exit();
    })
    .catch(err => console.log(err));
