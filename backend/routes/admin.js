const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Deal = require('../models/Deal');
const Order = require('../models/Order');
const SiteSettings = require('../models/SiteSettings');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const { range } = req.query;
        let dateFilter = {};
        
        if (range && range !== 'all') {
            const now = new Date();
            let startDate = new Date();
            if (range === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (range === 'month') {
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            } else if (range === 'year') {
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
            }
            dateFilter = { createdAt: { $gte: startDate } };
        }

        const [totalDeals, totalOrders, totalUsers, orders] = await Promise.all([
            Deal.countDocuments(),
            Order.countDocuments(dateFilter),
            User.countDocuments({ role: 'user' }),
            Order.find(dateFilter)
        ]);

        const newOrders = orders.filter(o => o.status === 'new').length;
        const acceptedOrders = orders.filter(o => o.status === 'accepted').length;
        const cookingOrders = orders.filter(o => o.status === 'cooking').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        const totalRevenue = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        // Category breakdown
        const categoryBreakdown = await Deal.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recent orders (last 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        res.json({
            totalDeals,
            totalOrders,
            totalUsers,
            newOrders,
            acceptedOrders,
            cookingOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue,
            categoryBreakdown,
            recentOrders
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all registered users
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        // Get order stats for each user
        const userIds = users.map(u => u._id);
        const orderStats = await Order.aggregate([
            { $match: { userId: { $in: userIds } } },
            {
                $group: {
                    _id: '$userId',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' }
                }
            }
        ]);

        const statsMap = {};
        orderStats.forEach(s => { statsMap[s._id.toString()] = s; });

        const usersWithStats = users.map(u => ({
            ...u.toObject(),
            totalOrders: statsMap[u._id.toString()]?.totalOrders || 0,
            totalSpent: statsMap[u._id.toString()]?.totalSpent || 0
        }));

        res.json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin user' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// @route   GET /api/admin/categories
// @desc    Get all unique categories
// @access  Admin
router.get('/categories', protect, adminOnly, async (req, res) => {
    try {
        const categories = await Deal.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get orders filtered by status (optional)
// @access  Admin
router.get('/orders', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// @route   GET /api/admin/orders/unseen-count
// @desc    Get count of unseen new orders (for notification polling)
// @access  Admin
router.get('/orders/unseen-count', protect, adminOnly, async (req, res) => {
    try {
        const count = await Order.countDocuments({ seen: false, status: 'new' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/mark-seen
// @desc    Mark all new orders as seen
// @access  Admin
router.put('/orders/mark-seen', protect, adminOnly, async (req, res) => {
    try {
        await Order.updateMany({ seen: false }, { seen: true });
        res.json({ message: 'All orders marked as seen' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/orders/clear
// @desc    Delete old completed orders to free up space
// @access  Admin
router.delete('/orders/clear', protect, adminOnly, async (req, res) => {
    try {
        const { olderThan } = req.query; // '30days', '1year', 'all'
        
        let dateFilter = { status: { $in: ['delivered', 'cancelled'] } }; // Only delete completed/cancelled
        
        if (olderThan === '30days') {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            dateFilter.createdAt = { $lte: date };
        } else if (olderThan === '1year') {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 1);
            dateFilter.createdAt = { $lte: date };
        } else if (olderThan === 'all') {
            // Keep dateFilter as is, deletes all delivered/cancelled
        } else {
            return res.status(400).json({ message: 'Invalid olderThan parameter' });
        }
        
        const result = await Order.deleteMany(dateFilter);
        res.json({ message: `Successfully deleted ${result.deletedCount} old orders.` });
    } catch (error) {
        console.error('Clear orders error:', error);
        res.status(500).json({ message: 'Server error clearing orders' });
    }
});

// @route   GET /api/admin/settings
// @desc    Get site settings
// @access  Public (settings needed for frontend)
router.get('/settings', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching settings' });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update site settings
// @access  Admin
router.put('/settings', protect, adminOnly, async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
        }

        const allowedFields = [
            'logoUrl', 'siteName', 'deliveryCharges', 'freeDeliveryMinimum', 'taxRate',
            'openingTime', 'closingTime', 'scheduleEnabled', 'isOpen', 'offDays',
            'contactPhone', 'contactEmail', 'address',
            'popupEnabled', 'popupImage', 'popupLink',
            'heroImages'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        if (req.body.heroImages !== undefined) {
            const raw = req.body.heroImages;
            const list = Array.isArray(raw)
                ? raw
                : typeof raw === 'string' && raw.trim()
                  ? [raw]
                  : [];
            settings.heroImages = list.map((u) => String(u).trim()).filter(Boolean);
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ message: 'Server error updating settings' });
    }
});

module.exports = router;
