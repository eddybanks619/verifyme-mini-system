const mongoose = require('mongoose');

const dlSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  issuedDate: { type: Date, required: true },
  class: { type: String },
  stateOfIssue: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DriversLicense', dlSchema);