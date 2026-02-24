const mongoose = require('mongoose');
const ClientOrganization = require('../models/ClientOrganization.model');
const billingService = require('../modules/billing/service/billing.service');

const GATEWAY_SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

const seedData = async () => {
  try {

    const { created: systemWalletCreated } = await billingService.findOrCreateWallet(GATEWAY_SYSTEM_ORG_ID);
    if (systemWalletCreated) {
      console.log('Gateway System Revenue Wallet created.');
    }

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

    const { created: clientWalletCreated } = await billingService.findOrCreateWallet(clientOrg._id.toString());
    
    if (clientWalletCreated) {
      console.log('Gateway Client Wallet created.');
      await billingService.fundWallet(clientOrg._id.toString(), 5000, 'INITIAL_SEED');
      console.log('Gateway Client Wallet seeded with 5000 NGN.');
    } else {
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