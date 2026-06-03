const mongoose = require('mongoose');

const categoryBannerSchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    bannerImage: {
        type: String,
        required: [true, 'Banner image is required']
    },
    description: {
        type: String,
        default: ''
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CategoryBanner', categoryBannerSchema);
