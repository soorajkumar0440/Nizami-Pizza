const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Deal = require('./models/Deal');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const menuItems = [
  // ROLLS
  {
    title: "Zinger Roll",
    price: 300,
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800",
    description: "Crispy zinger wrapped in a soft paratha.",
    category: "Rolls",
    tags: ["POPULAR"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Zinger Mayo Roll",
    price: 330,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800",
    description: "Crispy zinger roll loaded with extra mayo.",
    category: "Rolls",
    tags: [],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Zinger Cheese Roll",
    price: 350,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
    description: "Zinger roll loaded with melted cheese.",
    category: "Rolls",
    tags: ["CHEESY"],
    displayOn: "home",
    isAvailable: true
  },

  // CHICKEN BROAST
  {
    title: "Chest Broast",
    price: 420,
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800",
    description: "Crispy fried chicken chest piece.",
    category: "Chicken Broast",
    tags: ["CLASSIC"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Masala Chest Broast",
    price: 450,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800",
    description: "Spicy masala coated chest piece broast.",
    category: "Chicken Broast",
    tags: ["SPICY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Mayo Chest Broast",
    price: 520,
    image: "https://images.unsplash.com/photo-1626082895617-2c6ad22b3956?w=800",
    description: "Crispy chest broast loaded with special mayo.",
    category: "Chicken Broast",
    tags: [],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Leg Broast",
    price: 370,
    image: "https://images.unsplash.com/photo-1606683832368-294b6ce1235b?w=800",
    description: "Crispy fried chicken leg piece.",
    category: "Chicken Broast",
    tags: ["CLASSIC"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Masala Leg Broast",
    price: 390,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800",
    description: "Spicy masala coated leg piece broast.",
    category: "Chicken Broast",
    tags: ["SPICY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Chilli Spicy Leg Broast",
    price: 400,
    image: "https://images.unsplash.com/photo-1589301773812-78d105221dbb?w=800",
    description: "Extra spicy chilli coated leg broast.",
    category: "Chicken Broast",
    tags: ["EXTRA SPICY"],
    displayOn: "home",
    isAvailable: true
  },

  // BURGERS (Chicken)
  {
    title: "Chicken Burger",
    price: 300,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    description: "Classic grilled chicken burger.",
    category: "Burgers & Zingers",
    tags: [],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Chicken (Cheese) Burger",
    price: 350,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800",
    description: "Chicken burger with a slice of melted cheese.",
    category: "Burgers & Zingers",
    tags: ["CHEESY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Chicken Jumbo Burger",
    price: 550,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800",
    description: "Double patty large chicken burger.",
    category: "Burgers & Zingers",
    tags: ["JUMBO"],
    displayOn: "home",
    isAvailable: true
  },

  // BURGERS (Beef)
  {
    title: "Beef Burger",
    price: 300,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
    description: "Juicy grilled beef patty burger.",
    category: "Burgers & Zingers",
    tags: ["BEEF"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Beef (Cheese) Burger",
    price: 350,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800",
    description: "Beef burger topped with melted cheese.",
    category: "Burgers & Zingers",
    tags: ["BEEF", "CHEESY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Beef Jumbo Burger",
    price: 550,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    description: "Large double patty beef burger.",
    category: "Burgers & Zingers",
    tags: ["BEEF", "JUMBO"],
    displayOn: "home",
    isAvailable: true
  },

  // BURGERS (Zinger)
  {
    title: "Zinger Burger",
    price: 350,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800",
    description: "Crispy fried chicken zinger fillet.",
    category: "Burgers & Zingers",
    tags: ["BESTSELLER"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Zinger (Cheese) Burger",
    price: 400,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800",
    description: "Zinger burger with extra cheese.",
    category: "Burgers & Zingers",
    tags: ["POPULAR", "CHEESY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Zinger Jumbo Burger",
    price: 600,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    description: "Huge zinger burger for large cravings.",
    category: "Burgers & Zingers",
    tags: ["JUMBO"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Zinger (Cheese) Jumbo",
    price: 650,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800",
    description: "The ultimate jumbo zinger loaded with cheese.",
    category: "Burgers & Zingers",
    tags: ["JUMBO", "CHEESY"],
    displayOn: "home",
    isAvailable: true
  },

  // CLUB SANDWICH
  {
    title: "Club Sandwich",
    price: 320,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
    description: "Classic three-layer sandwich with chicken, egg and veggies.",
    category: "Club Sandwich",
    tags: ["CLASSIC"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Club (Cheese) Sandwich",
    price: 380,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
    description: "Classic club sandwich loaded with cheese.",
    category: "Club Sandwich",
    tags: ["CHEESY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "BBQ Club Sandwich",
    price: 450,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
    description: "Club sandwich with BBQ chicken filling.",
    category: "Club Sandwich",
    tags: ["BBQ"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Malai Club Sandwich",
    price: 500,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
    description: "Rich and creamy chicken malai boti sandwich.",
    category: "Club Sandwich",
    tags: ["PREMIUM"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Crispy Club Sandwich",
    price: 370,
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
    description: "Sandwich loaded with crispy fried chicken.",
    category: "Club Sandwich",
    tags: ["CRISPY"],
    displayOn: "home",
    isAvailable: true
  },
  {
    title: "Crispy (Cheese) Sandwich",
    price: 450,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
    description: "Crispy chicken sandwich with melted cheese.",
    category: "Club Sandwich",
    tags: ["CRISPY", "CHEESY"],
    displayOn: "home",
    isAvailable: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to DB');

    // Delete old dummy products (keep Pizzas, Drinks, Deals)
    const result = await Deal.deleteMany({
      category: { $in: ['Rolls', 'Chicken Broast', 'Burgers & Zingers', 'Club Sandwich'] }
    });
    console.log(`🗑️ Deleted ${result.deletedCount} old products`);

    // Insert new products
    await Deal.insertMany(menuItems);
    console.log(`🎉 Added ${menuItems.length} new products to the menu!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
