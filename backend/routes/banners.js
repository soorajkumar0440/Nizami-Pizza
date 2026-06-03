const express = require('express');
const router = express.Router();
const CategoryBanner = require('../models/CategoryBanner');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/banners
// @desc    Get all active banners (sorted by sortOrder)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.activeOnly !== 'false') {
            filter.isActive = true;
        }
        const banners = await CategoryBanner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching banners' });
    }
});

// @route   GET /api/banners/:id
// @desc    Get single banner
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const banner = await CategoryBanner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/banners
// @desc    Create a new category banner
// @access  Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { categoryName, bannerImage, description, sortOrder, isActive } = req.body;

        if (!categoryName || !bannerImage) {
            return res.status(400).json({ message: 'Category name and banner image are required' });
        }

        // Check if banner for this category already exists
        const existing = await CategoryBanner.findOne({ categoryName });
        if (existing) {
            return res.status(400).json({ message: `Banner for "${categoryName}" already exists. Edit it instead.` });
        }

        const banner = await CategoryBanner.create({
            categoryName,
            bannerImage,
            description: description || '',
            sortOrder: sortOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(banner);
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({ message: 'Server error creating banner' });
    }
});

// @route   PUT /api/banners/:id
// @desc    Update a banner
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const banner = await CategoryBanner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const { categoryName, bannerImage, description, sortOrder, isActive } = req.body;

        // If changing category name, check for duplicates
        if (categoryName && categoryName !== banner.categoryName) {
            const existing = await CategoryBanner.findOne({ categoryName });
            if (existing) {
                return res.status(400).json({ message: `Banner for "${categoryName}" already exists.` });
            }
            banner.categoryName = categoryName;
        }

        if (bannerImage !== undefined) banner.bannerImage = bannerImage;
        if (description !== undefined) banner.description = description;
        if (sortOrder !== undefined) banner.sortOrder = sortOrder;
        if (isActive !== undefined) banner.isActive = isActive;

        const updated = await banner.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating banner' });
    }
});

// @route   DELETE /api/banners/:id
// @desc    Delete a banner
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const banner = await CategoryBanner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        await CategoryBanner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting banner' });
    }
});

module.exports = router;
