const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  verificationType: { type: String, required: true },
  searchId: { type: String, required: true },
  purpose: { type: String, required: true },
  mode: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'NOT_FOUND'], required: true },
  fieldsAccessed: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);