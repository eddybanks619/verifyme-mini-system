const mongoose = require('mongoose');

const bvnSchema = new mongoose.Schema({
  bvn: { type: String, required: true, unique: true, length: 11 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true },
  enrollmentBank: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BVN', bvnSchema);