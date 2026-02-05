const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  verificationType: {
    type: String
    // Removed enum to allow flexibility for future types
  },
  searchId: {
    type: String
  },
  status: {
    type: String,
    default: 'SUCCESS'
  },
  provider: {
    type: String,
    default: 'GOV_PROVIDER'
  },
  responsePayload: {
    type: mongoose.Schema.Types.Mixed // Allows any structure
  },
  errorMessage: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
}, { strict: false }); // Allow other fields to be saved if needed

module.exports = mongoose.model('VerificationLog', verificationLogSchema);