const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const SiteSettings = require('../models/SiteSettings');
const { protect, adminOnly } = require('../middleware/auth');

const { isShopOpen, getShopClosedMessage } = require('../utils/shopStatus');

// @route   POST /api/orders
// @desc    Place a new order (no login required)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const {
            items,
            totalPrice,
            customerName,
            phone,
            alternateMobile,
            address,
            landmark,
            email,
            orderType,
            deliveryFee,
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        if (!customerName || !String(customerName).trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        if (!phone || !String(phone).trim()) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const type = orderType === 'pickup' ? 'pickup' : 'delivery';

        if (type === 'delivery' && (!address || !String(address).trim())) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }

        const siteSettings = await SiteSettings.findOne();
        if (!isShopOpen(siteSettings)) {
            return res.status(403).json({ message: getShopClosedMessage(siteSettings) });
        }

        const order = await Order.create({
            customerName: String(customerName).trim(),
            customerEmail: email ? String(email).trim() : '',
            customerPhone: String(phone).trim(),
            alternateMobile: alternateMobile ? String(alternateMobile).trim() : '',
            address: type === 'pickup'
                ? (address ? String(address).trim() : 'Pickup at shop')
                : String(address).trim(),
            landmark: landmark ? String(landmark).trim() : '',
            orderType: type,
            deliveryFee: type === 'delivery' ? (Number(deliveryFee) || 0) : 0,
            items,
            totalPrice,
            status: 'new',
            seen: false
        });

        res.status(201).json({
            message: 'Order placed successfully!',
            order
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Server error placing order' });
    }
});

// @route   GET /api/orders
// @desc    Get logged-in user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// @route   GET /api/orders/all
// @desc    Get all orders (admin)
// @access  Admin
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all orders' });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating order status' });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order (admin)
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted', orderId: order._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting order' });
    }
});

module.exports = router;
