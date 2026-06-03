const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Deal = require('./models/Deal');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitehub')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const specialDeals = [
    {
        title: 'Nizami Royal Platter',
        description: 'A grand assortment of malai boti, seekh kebabs, and tikka, served with mint chutney and fresh naan.',
        price: 2500,
        category: 'Signature',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000',
        tags: ['ULTRA PREMIUM', '01'],
        displayOn: 'deals'
    },
    {
        title: 'Signature Broast',
        description: 'Golden, crispy, and juicy chicken broast marinated in our secret Nizami spices, served with garlic mayo.',
        price: 1200,
        category: 'Signature',
        image: 'https://images.unsplash.com/photo-1544025162-836e525120e2?q=80&w=2000',
        tags: ['SIGNATURE', '02'],
        displayOn: 'deals'
    },
    {
        title: 'Stuffed Crown Pizza',
        description: 'Our famous pizza with a crust stuffed with creamy chicken and melted mozzarella, topped with rich toppings.',
        price: 1200,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000',
        tags: ['LIMITED EDITION', '03'],
        sizes: [
            { name: 'Small', price: 1200 },
            { name: 'Medium', price: 1850 },
            { name: 'Large', price: 2450 }
        ],
        displayOn: 'deals'
    }
];

const seedDeals = async () => {
    try {
        // First delete any deals that match these titles to avoid duplicates
        await Deal.deleteMany({ title: { $in: specialDeals.map(d => d.title) } });
        
        await Deal.insertMany(specialDeals);
        console.log('Special Deals Seeded Successfully! 🍔🍕');
        process.exit();
    } catch (error) {
        console.error('Error seeding deals:', error);
        process.exit(1);
    }
};

seedDeals();
