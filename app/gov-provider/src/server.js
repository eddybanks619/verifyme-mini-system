require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const seedData = require('./utils/seeder');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gov-provider';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB (Gov Provider)');
    await seedData();
    app.listen(PORT, () => {
      console.log(`Gov Provider Service running on port ${PORT}`);
      //process.exit(1)
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });