const mongoose = require('mongoose');
const ClientOrganization = require('../models/ClientOrganization.model');
const billingService = require('../modules/billing/service/billing.service');

const GATEWAY_SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000'; // Fixed UUID for gateway system

const seedData = async () => {
  try {
    // 1. Seed Gateway's Internal System Wallet (Revenue Account)
    const { created: systemWalletCreated } = await billingService.findOrCreateWallet(GATEWAY_SYSTEM_ORG_ID);
    if (systemWalletCreated) {
      console.log('Gateway System Revenue Wallet created.');
    }

    // 2. Seed Client Organization for the Gateway
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

    // 3. Seed Client Wallet for the Gateway's client
    // We use the MongoDB _id string as the organizationId in Postgres
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

    console.log('Gateway Data seeded successfully');
  } catch (error) {
    console.error('Gateway Seeding error:', error);
  }
};

module.exports = seedData;