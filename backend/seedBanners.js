const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CategoryBanner = require('./models/CategoryBanner');
const Deal = require('./models/Deal');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitehub')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const banners = [
    {
        categoryName: 'Pizza',
        bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2400',
        description: 'Authentic Italian & Signature Crown Crusts',
        sortOrder: 1,
        isActive: true
    },
    {
        categoryName: 'Burgers & Zingers',
        bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2400',
        description: 'Crispy Zingers & Premium Beef Masterpieces',
        sortOrder: 2,
        isActive: true
    },
    {
        categoryName: 'Rolls',
        bannerImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2400',
        description: 'Flavor-Packed Wraps & Paratha Rolls',
        sortOrder: 4,
        isActive: true
    },
    {
        categoryName: 'Chicken Broast',
        bannerImage: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2400',
        description: 'Golden Fried Chicken, Crispy to the Bone',
        sortOrder: 5,
        isActive: true
    },
    {
        categoryName: 'Drink',
        bannerImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2400',
        description: 'Chilled Beverages & Signature Mocktails',
        sortOrder: 6,
        isActive: true
    }
];

const seedBanners = async () => {
    try {
        await CategoryBanner.deleteMany(); // Clear existing banners
        await CategoryBanner.insertMany(banners);
        console.log('Banners Seeded Successfully! 🖼️✅');

        // Update all existing products to use the combined category
        const updated = await Deal.updateMany(
            { category: { $in: ['Burger', 'Zinger'] } },
            { $set: { category: 'Burgers & Zingers' } }
        );
        console.log(`Updated ${updated.modifiedCount} products to 'Burgers & Zingers' category.`);

        process.exit();
    } catch (error) {
        console.error('Error seeding banners:', error);
        process.exit(1);
    }
};

seedBanners();
