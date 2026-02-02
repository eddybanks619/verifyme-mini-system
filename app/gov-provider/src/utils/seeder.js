const mongoose = require('mongoose');
const NIN = require('../modules/nin/nin.model');
const BVN = require('../modules/bvn/bvn.model');
const Passport = require('../modules/passport/passport.model');
const DriversLicense = require('../modules/drivers-license/dl.model');

const seedData = async () => {
  try {
    // Check if data exists
    const ninCount = await NIN.countDocuments();
    if (ninCount > 0) return;

    console.log('Seeding data...');

    await NIN.create({
      nin: '11111111111',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'M',
      phone: '08012345678'
    });

    await BVN.create({
      bvn: '22222222222',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1992-02-02'),
      phone: '08087654321',
      enrollmentBank: 'FirstBank'
    });
    
    await Passport.create({
      passportNumber: 'A12345678',
      firstName: 'Alice',
      lastName: 'Smith',
      dateOfBirth: new Date('1985-05-15'),
      expiryDate: new Date('2030-05-14'),
      issueDate: new Date('2020-05-15')
    });

    await DriversLicense.create({
      licenseNumber: 'ABC123456789',
      firstName: 'Bob',
      lastName: 'Brown',
      dateOfBirth: new Date('1988-08-08'),
      expiryDate: new Date('2025-08-08'),
      issuedDate: new Date('2020-08-08'),
      stateOfIssue: 'Lagos'
    });

    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedData;