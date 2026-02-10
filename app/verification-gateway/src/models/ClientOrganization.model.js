const mongoose = require('mongoose');

const clientOrganizationSchema = new mongoose.Schema({
  name: { type: String,},
  clientId: { type: String, unique: true },
  clientSecret: { type: String },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClientOrganization', clientOrganizationSchema);