require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const { connectDB, sequelize } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { startWorker } = require('./workers/verification.worker');
const seedData = require('./utils/seeder');

// Import Sequelize Models to ensure they are registered before sync
require('./modules/billing/data/models/wallet.model');
require('./modules/billing/data/models/transaction.model');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/verification-gateway';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Verification Gateway)');

    // Connect to PostgreSQL
    await connectDB();
    
    // Sync Sequelize Models
    await sequelize.sync();
    console.log('PostgreSQL Database Synced');

    // Connect to Redis
    await connectRedis();

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start Worker
    startWorker();

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