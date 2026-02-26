const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  verificationType: {
    type: String,
    required: true,
  },
  searchId: {
    type: String,
    required: true,
  },
  mode: {
    type: String, // Store the mode (e.g., 'basic_identity')
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  provider: {
    type: String,
    default: 'GOV_PROVIDER',
  },
  responsePayload: {
    type: mongoose.Schema.Types.Mixed,
  },
  errorMessage: {
    type: String,
  },
  clientOrganizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientOrganization',
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);