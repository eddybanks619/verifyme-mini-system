const mongoose = require('mongoose');

const passportSchema = new mongoose.Schema({
  passportNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  issueDate: { type: Date, required: true },
  nationality: { type: String, default: 'Nigerian' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Passport', passportSchema);