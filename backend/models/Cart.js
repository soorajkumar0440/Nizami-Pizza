const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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
        default: 0
    }
}, {
    timestamps: true
});

// Auto-calculate total price
cartSchema.pre('save', function(next) {
    this.totalPrice = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
