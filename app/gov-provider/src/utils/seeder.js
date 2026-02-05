const mongoose = require('mongoose');
const NIN = require('../modules/nin/nin.model');
const BVN = require('../modules/bvn/bvn.model');
const Passport = require('../modules/passport/passport.model');
const DriversLicense = require('../modules/drivers-license/dl.model');
const Organization = require('../models/Organization.model');

const seedData = async () => {
  try {
    // Check if data exists
    const ninCount = await NIN.countDocuments();
    if (ninCount === 0) {
      console.log('Seeding Identity Data...');

      const unsplashImage = 'https://images.unsplash.com/photo-1472586662442-3eec04b9dbda?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

      await NIN.create({
        nin: '11111111111',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        phone: '08012345678',
        image: unsplashImage
      });

      await BVN.create({
        bvn: '22222222222',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('1992-02-02'),
        phone: '08087654321',
        enrollmentBank: '033',
        image: unsplashImage
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
    }

    // Seed Organization
    const orgCount = await Organization.countDocuments();
    if (orgCount === 0) {
      console.log('Seeding Organization Data...');
      await Organization.create({
        name: 'Verification Gateway Inc.',
        clientId: 'gov-client-id',
        clientSecret: 'gov-secret-key', // In real app, hash this!
        status: 'ACTIVE',
        permissions: {
          NIN: ['existence_check', 'basic_identity', 'full_profile'],
          BVN: ['existence_check'],
          PASSPORT: ['existence_check', 'basic_identity', 'full_profile'],
          DRIVERS_LICENSE: ['existence_check', 'basic_identity', 'full_profile']
        },
        rateLimit: 100
      });
    }

    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedData;