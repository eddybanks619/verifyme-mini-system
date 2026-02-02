const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  verificationType: {
    type: String,
    required: true,
    enum: ['NIN', 'BVN', 'PASSPORT', 'DRIVERS_LICENSE']
  },
  searchId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'NOT_FOUND'],
    default: 'SUCCESS'
  },
  provider: {
    type: String,
    default: 'GOV_PROVIDER'
  },
  responsePayload: {
    type: Object
  },
  errorMessage: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VerificationLog', verificationLogSchema);