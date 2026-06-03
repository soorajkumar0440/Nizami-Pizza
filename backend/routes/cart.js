const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching cart' });
    }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { dealId, title, price, quantity, image, size } = req.body;

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }

        // Check if item already in cart (match on dealId AND size)
        const existingIndex = cart.items.findIndex(
            item => item.dealId && item.dealId.toString() === dealId && (item.size || '') === (size || '')
        );

        if (existingIndex > -1) {
            // Update quantity
            cart.items[existingIndex].quantity += (quantity || 1);
        } else {
            // Add new item
            cart.items.push({
                dealId,
                title,
                price,
                size: size || '',
                quantity: quantity || 1,
                image
            });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error adding to cart' });
    }
});

// @route   PUT /api/cart/:itemId
// @desc    Update item quantity in cart
// @access  Private
router.put('/:itemId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity < 1) {
            // Remove item if quantity is 0
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating cart' });
    }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item._id.toString() !== req.params.itemId
        );

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error removing from cart' });
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({ message: 'Cart cleared', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error clearing cart' });
    }
});

module.exports = router;
