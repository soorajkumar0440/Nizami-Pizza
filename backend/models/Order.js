const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    customerName: {
        type: String,
        default: 'Guest'
    },
    customerEmail: {
        type: String,
        default: ''
    },
    customerPhone: {
        type: String,
        default: ''
    },
    alternateMobile: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    landmark: {
        type: String,
        default: ''
    },
    orderType: {
        type: String,
        enum: ['delivery', 'pickup'],
        default: 'delivery'
    },
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    items: [{
        dealId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deal'
        },
        title: String,
        price: Number,
        size: {
            type: String,
            default: ''
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        image: String
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['new', 'accepted', 'cooking', 'delivered', 'cancelled'],
        default: 'new'
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
