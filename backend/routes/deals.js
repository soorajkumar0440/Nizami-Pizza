const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const { protect, adminOnly } = require('../middleware/auth');

const ALLOWED_CATEGORIES = [
    'Deal',
    'Pizza',
    'Burgers & Zingers',
    'Rolls',
    'Club Sandwich',
    'Chicken Broast',
    'Drink',
];

function normalizeCategory(category) {
    const raw = String(category || '').trim();
    if (!raw) return 'Pizza';
    const lower = raw.toLowerCase();
    const aliases = {
        deal: 'Deal',
        deals: 'Deal',
        burger: 'Burgers & Zingers',
        burgers: 'Burgers & Zingers',
        'burgers & zingers': 'Burgers & Zingers',
        zingers: 'Burgers & Zingers',
        broast: 'Chicken Broast',
        'chicken broast': 'Chicken Broast',
        sandwich: 'Club Sandwich',
        'club sandwich': 'Club Sandwich',
        'club sandwish': 'Club Sandwich',
        drinks: 'Drink',
    };
    if (aliases[lower]) return aliases[lower];
    const match = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === lower);
    return match || 'Pizza';
}

// @route   GET /api/deals
// @desc    Get all deals
// @access  Public
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.displayOn) {
            filter.displayOn = req.query.displayOn;
        }
        const deals = await Deal.find(filter).sort({ createdAt: -1 });
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching deals' });
    }
});

// @route   GET /api/deals/search
// @desc    Search deals by query
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === '') {
            const deals = await Deal.find().sort({ createdAt: -1 });
            return res.json(deals);
        }

        // Search using regex for partial matching
        const searchRegex = new RegExp(q.trim(), 'i');
        const deals = await Deal.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { tags: searchRegex }
            ]
        }).sort({ createdAt: -1 });

        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: 'Server error during search' });
    }
});

// @route   GET /api/deals/:id
// @desc    Get single deal
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/deals
// @desc    Create a new deal
// @access  Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, price, image, description, category, tags, sizes } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ message: 'Title and price are required' });
        }

        const { displayOn, isAvailable } = req.body;

        const normalizedCategory = normalizeCategory(category);
        const effectiveDisplayOn = normalizedCategory === 'Deal' ? 'deals' : (displayOn || 'home');

        const deal = await Deal.create({
            title,
            price,
            image: image || '',
            description: description || '',
            category: normalizedCategory,
            tags: tags || [],
            sizes: sizes || [],
            displayOn: effectiveDisplayOn,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });

        res.status(201).json(deal);
    } catch (error) {
        console.error('Create deal error:', error);
        res.status(500).json({ message: 'Server error creating deal' });
    }
});

// @route   PUT /api/deals/:id
// @desc    Update a deal
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        const { title, price, image, description, category, tags, sizes, displayOn, isAvailable } = req.body;

        deal.title = title || deal.title;
        deal.price = price !== undefined ? price : deal.price;
        deal.image = image !== undefined ? image : deal.image;
        deal.description = description !== undefined ? description : deal.description;
        if (category !== undefined) deal.category = normalizeCategory(category);
        deal.tags = tags || deal.tags;
        deal.sizes = sizes !== undefined ? sizes : deal.sizes;
        // Auto-set displayOn for Deal category
        if (deal.category === 'Deal') {
            deal.displayOn = 'deals';
        } else {
            deal.displayOn = displayOn || deal.displayOn;
        }
        if (isAvailable !== undefined) deal.isAvailable = isAvailable;

        const updatedDeal = await deal.save();
        res.json(updatedDeal);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating deal' });
    }
});

// @route   DELETE /api/deals/:id
// @desc    Delete a deal
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        await Deal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting deal' });
    }
});

module.exports = router;
