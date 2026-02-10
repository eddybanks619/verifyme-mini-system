require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const seedData = require('./utils/seeder');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/verification-gateway';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Verification Gateway)');

    // Connect to PostgreSQL
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Seed Data
    await seedData();

    app.listen(PORT, () => {
      console.log(`Verification Gateway running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Gateway Startup error:', err);
    process.exit(1);
  }
};

startServer();