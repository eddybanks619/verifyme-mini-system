require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/verification-gateway';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB (Verification Gateway)');
    app.listen(PORT, () => {
      console.log(`Verification Gateway running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });