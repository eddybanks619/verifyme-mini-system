const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientId: { type: String, required: true, unique: true },
  clientSecret: { type: String, required: true }, // In a real app, this should be hashed
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  permissions: {
    NIN: { type: [String], enum: ['VERIFY_ONLY', 'BIODATA'], default: [] },
    BVN: { type: [String], enum: ['VERIFY_ONLY', 'BIODATA'], default: [] },
    PASSPORT: { type: [String], enum: ['VERIFY_ONLY', 'BIODATA'], default: [] },
    DRIVERS_LICENSE: { type: [String], enum: ['VERIFY_ONLY', 'BIODATA'], default: [] }
  },
  rateLimit: { type: Number, default: 100 }, // Requests per minute
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);