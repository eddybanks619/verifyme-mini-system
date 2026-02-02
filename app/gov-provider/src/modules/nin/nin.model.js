const mongoose = require('mongoose');

const ninSchema = new mongoose.Schema({
  nin: { type: String, required: true, unique: true, length: 11 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['M', 'F'] },
  address: { type: String },
  phone: { type: String },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NIN', ninSchema);