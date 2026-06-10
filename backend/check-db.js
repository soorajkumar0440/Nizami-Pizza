const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Deal = require('./models/Deal');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const deals = await Deal.find().sort({ createdAt: -1 });
  console.log('Total deals in DB:', deals.length);
  console.log('\n--- ALL PRODUCTS ---');
  deals.forEach(d => console.log(`[${d.category}] ${d.title} - Rs.${d.price}`));
  
  // Count by category
  const cats = {};
  deals.forEach(d => { cats[d.category] = (cats[d.category] || 0) + 1; });
  console.log('\n--- CATEGORY COUNTS ---');
  Object.entries(cats).forEach(([k,v]) => console.log(`${k}: ${v}`));
  
  process.exit(0);
}
check();
