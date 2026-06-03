const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    logoUrl: {
        type: String,
        default: ''
    },
    siteName: {
        type: String,
        default: 'Nizami'
    },
    deliveryCharges: {
        type: Number,
        default: 150
    },
    freeDeliveryMinimum: {
        type: Number,
        default: 2000
    },
    taxRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    },
    openingTime: {
        type: String,
        default: ''
    },
    closingTime: {
        type: String,
        default: ''
    },
    scheduleEnabled: {
        type: Boolean,
        default: false
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    offDays: [{
        type: String,
        trim: true
    }],
    contactPhone: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    popupEnabled: {
        type: Boolean,
        default: false
    },
    popupImage: {
        type: String,
        default: ''
    },
    popupLink: {
        type: String,
        default: ''
    },
    heroImages: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
