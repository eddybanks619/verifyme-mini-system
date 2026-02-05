const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientId: { type: String, required: true, unique: true },
  clientSecret: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  permissions: {
    NIN: { type: [String], enum: ['existence_check', 'basic_identity', 'full_profile'], default: [] },
    BVN: { type: [String], enum: ['existence_check', 'basic_identity', 'full_profile'], default: [] },
    PASSPORT: { type: [String], enum: ['existence_check', 'basic_identity', 'full_profile'], default: [] },
    DRIVERS_LICENSE: { type: [String], enum: ['existence_check', 'basic_identity', 'full_profile'], default: [] }
  },
  rateLimit: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);