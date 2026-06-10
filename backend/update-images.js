const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Deal = require('./models/Deal');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();
const MONGODB_URI = "mongodb+srv://lukezoy77_db_user:SSXR9KqjNDWulaR4@cluster0.besvfjn.mongodb.net/foodDB?retryWrites=true&w=majority";

const images = [
  "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?w=800",
  "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
  "https://images.unsplash.com/photo-1588674488344-934cbb233959?w=800",
  "https://images.unsplash.com/photo-1615486171448-4ca3fbeafcc1?w=800",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800",
  "https://images.unsplash.com/photo-1562967914-608f82629710?w=800"
];

async function updateImages() {
  await mongoose.connect(MONGODB_URI);
  const deals = await Deal.find({ category: "Chicken Broast" });
  for (let i = 0; i < deals.length; i++) {
    deals[i].image = images[i % images.length];
    await deals[i].save();
    console.log(`Updated image for ${deals[i].title}`);
  }
  process.exit(0);
}
updateImages();
