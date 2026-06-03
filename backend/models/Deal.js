const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Pizza',
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    sizes: [{
        name: { type: String, trim: true },
        price: { type: Number, min: 0 }
    }],
    displayOn: {
        type: String,
        enum: ['home', 'deals'],
        default: 'home'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Text index for search
dealSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Deal', dealSchema);
