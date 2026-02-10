const mongoose = require('mongoose');
const ClientOrganization = require('../models/ClientOrganization.model');
const billingService = require('../modules/billing/service/billing.service'); // Will be created later

const GATEWAY_SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000'; // Fixed UUID for gateway system

const seedData = async () => {
  try {
    // Seed Client Organization for the Gateway
    let clientOrg = await ClientOrganization.findOne({ clientId: 'test-client-id' });
    if (!clientOrg) {
      console.log('Seeding Gateway Client Organization...');
      clientOrg = await ClientOrganization.create({
        name: 'Test Client App',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        status: 'ACTIVE'
      });
    }

    // Seed Client Wallet for the Gateway's client
    // This part will be updated once billingService is defined
    // For now, we'll just ensure the clientOrg exists.

    // Seed Gateway's Internal System Wallet (to pay Gov Provider)
    // This part will be updated once billingService is defined
    // For now, we'll just ensure the clientOrg exists.

    console.log('Gateway Data seeded successfully');
  } catch (error) {
    console.error('Gateway Seeding error:', error);
  }
};

module.exports = seedData;