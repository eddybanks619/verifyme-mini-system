const mongoose = require('mongoose');
const ClientOrganization = require('../models/ClientOrganization.model');
const billingService = require('../modules/billing/service/billing.service');

const GATEWAY_SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000'; // Fixed UUID for gateway system

const seedData = async () => {
  try {
    console.log('Starting Gateway Seeding...');

    // 1. Seed Gateway's Internal System Wallet (Revenue Account)
    try {
      const { created: systemWalletCreated } = await billingService.findOrCreateWallet(GATEWAY_SYSTEM_ORG_ID);
      if (systemWalletCreated) {
        console.log('Gateway System Revenue Wallet created.');
      }
    } catch (billingError) {
      console.error('Failed to seed System Wallet:', billingError.message);
    }

    // 2. Seed Client Organization for the Gateway
    let clientOrg = await ClientOrganization.findOne({ clientId: 'test-client-id' });
    if (!clientOrg) {
      console.log('Seeding Gateway Client Organization...');
      try {
        clientOrg = await ClientOrganization.create({
          name: 'Test Client App',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          status: 'ACTIVE'
        });
        console.log('Gateway Client Organization created successfully.');
      } catch (createError) {
        console.error('Failed to create Client Organization:', createError.message);
        return; // Stop if we can't create the client
      }
    } else {
      console.log('Gateway Client Organization already exists.');
    }

    // 3. Seed Client Wallet for the Gateway's client
    try {
      const { created: clientWalletCreated } = await billingService.findOrCreateWallet(clientOrg._id.toString());
      
      if (clientWalletCreated) {
        console.log('Gateway Client Wallet created.');
        // Fund it so they can make requests immediately
        await billingService.fundWallet(clientOrg._id.toString(), 5000, 'INITIAL_SEED');
        console.log('Gateway Client Wallet seeded with 5000 NGN.');
      } else {
          // Optional: Ensure it has funds even if it existed
          const balance = await billingService.getBalance(clientOrg._id.toString());
          if (Number(balance) < 1000) {
               await billingService.fundWallet(clientOrg._id.toString(), 5000, 'TOPUP_SEED');
               console.log('Gateway Client Wallet topped up.');
          }
      }
    } catch (walletError) {
      console.error('Failed to seed Client Wallet:', walletError.message);
    }

    console.log('Gateway Data seeded successfully');
  } catch (error) {
    console.error('Gateway Seeding error:', error);
  }
};

module.exports = seedData;