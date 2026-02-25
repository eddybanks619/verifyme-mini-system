require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const seedData = require('./utils/seeder');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { startWorker } = require('./workers/verification.worker');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gov-provider';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Gov Provider)');

    // Connect to PostgreSQL
    await connectDB();

    // Connect to Redis
    await connectRedis();

     // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start Worker
    startWorker();

    // Seed Data
    await seedData();

    app.listen(PORT, () => {
      console.log(`Gov Provider Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

startServer();