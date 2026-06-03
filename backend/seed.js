const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Deal = require('./models/Deal');
const SiteSettings = require('./models/SiteSettings');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Deal.deleteMany({});
        await SiteSettings.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@nizami.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('👤 Admin created: admin@nizami.com / admin123');

        // Create default site settings
        await SiteSettings.create({
            siteName: 'Nizami',
            logoUrl: '',
            deliveryCharges: 150,
            freeDeliveryMinimum: 2000,
            taxRate: 10,
            openingTime: '11:00 AM',
            closingTime: '1:00 AM',
            isOpen: true,
            offDays: [],
            contactPhone: '03132464330',
            contactEmail: 'orders@nizamifood.com',
            address: 'Liaquatabad No 2, Near Super Market, Karachi'
        });
        console.log('⚙️  Default site settings created');

        // Create sample deals
        const deals = await Deal.insertMany([
            // === BURGER ===
            {
                title: 'Classic Zinger Burger',
                price: 450,
                image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800',
                description: 'Crispy zinger fillet, lettuce, mayo, toasted sesame bun.',
                category: 'Burgers & Zingers',
                tags: ['BESTSELLER']
            },
            {
                title: 'Double Decker Burger',
                price: 650,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
                description: 'Double patty, cheese, jalapenos, special sauce, sesame bun.',
                category: 'Burgers & Zingers',
                tags: ['NEW']
            },
            {
                title: 'Chicken Cheese Burger',
                price: 500,
                image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
                description: 'Grilled chicken patty, cheddar cheese, veggies, garlic mayo.',
                category: 'Burgers & Zingers',
                tags: ['POPULAR']
            },

            // === ROLLS ===
            {
                title: 'Chicken Paratha Roll',
                price: 350,
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
                description: 'Spicy chicken tikka wrapped in fresh paratha with chutney.',
                category: 'Rolls',
                tags: ['BESTSELLER']
            },
            {
                title: 'Seekh Kabab Roll',
                price: 300,
                image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
                description: 'Juicy seekh kabab in naan with salad and raita.',
                category: 'Rolls',
                tags: ['POPULAR']
            },
            {
                title: 'Zinger Roll',
                price: 400,
                image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800',
                description: 'Crispy zinger strips, coleslaw, garlic sauce in tortilla wrap.',
                category: 'Rolls',
                tags: ['SPICY']
            },

            // === PIZZA ===
            {
                title: 'Chicken Tikka Pizza',
                price: 799,
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
                description: 'Loaded with chicken tikka, onions, capsicum, mozzarella.',
                category: 'Pizza',
                tags: ['BESTSELLER'],
                sizes: [
                    { name: 'Small', price: 799 },
                    { name: 'Medium', price: 1199 },
                    { name: 'Large', price: 1599 }
                ]
            },
            {
                title: 'Fajita Pizza',
                price: 849,
                image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800',
                description: 'Spicy fajita chicken, olives, mushrooms, cheese blend.',
                category: 'Pizza',
                tags: ['PREMIUM'],
                sizes: [
                    { name: 'Small', price: 849 },
                    { name: 'Medium', price: 1249 },
                    { name: 'Large', price: 1649 }
                ]
            },
            {
                title: 'Pepperoni Pizza',
                price: 699,
                image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800',
                description: 'Classic pepperoni with extra mozzarella and oregano.',
                category: 'Pizza',
                tags: ['CLASSIC'],
                sizes: [
                    { name: 'Small', price: 699 },
                    { name: 'Medium', price: 1099 },
                    { name: 'Large', price: 1499 }
                ]
            },

            // === BROAST ===
            {
                title: 'Broast Full (8 pcs)',
                price: 1200,
                image: 'https://images.unsplash.com/photo-1626645738196-c2a98694a56a?w=800',
                description: '8 pieces crispy broast chicken with fries and coleslaw.',
                category: 'Chicken Broast',
                tags: ['FAMILY', 'BESTSELLER']
            },
            {
                title: 'Broast Half (4 pcs)',
                price: 650,
                image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800',
                description: '4 pieces crispy broast with fries and dip.',
                category: 'Chicken Broast',
                tags: ['POPULAR']
            },
            {
                title: 'Broast Wings (6 pcs)',
                price: 500,
                image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800',
                description: 'Crispy fried wings with special hot sauce.',
                category: 'Chicken Broast',
                tags: ['SPICY']
            },

            // === CLUB SANDWICH ===
            {
                title: 'Chicken Club Sandwich',
                price: 550,
                image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
                description: 'Triple layer grilled chicken, egg, cheese, lettuce, mayo.',
                category: 'Club Sandwich',
                tags: ['BESTSELLER']
            },
            {
                title: 'Beef Club Sandwich',
                price: 650,
                image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
                description: 'Grilled beef strips, cheese, veggies, special sauce.',
                category: 'Club Sandwich',
                tags: ['PREMIUM']
            },
            {
                title: 'Zinger Club Sandwich',
                price: 600,
                image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
                description: 'Crispy zinger fillet, egg, coleslaw, cheese in toasted bread.',
                category: 'Club Sandwich',
                tags: ['NEW']
            },

            // === DRINK ===
            {
                title: 'Fresh Lime Mint',
                price: 200,
                image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800',
                description: 'Freshly squeezed lime with mint and soda.',
                category: 'Drink',
                tags: ['REFRESHING']
            },
            {
                title: 'Mango Shake',
                price: 250,
                image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800',
                description: 'Thick mango milkshake with cream topping.',
                category: 'Drink',
                tags: ['POPULAR']
            },
            {
                title: 'Oreo Shake',
                price: 300,
                image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
                description: 'Creamy oreo milkshake with whipped cream and cookie crumbs.',
                category: 'Drink',
                tags: ['BESTSELLER']
            },

        ]);

        console.log(`🍔 ${deals.length} deals created`);
        console.log('\n✅ Seed completed successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
