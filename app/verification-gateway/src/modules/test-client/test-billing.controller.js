const billingService = require('../billing/service/billing.service');
const ClientOrganization = require('../../models/ClientOrganization.model');

const getTestClientOrgId = async () => {
  const clientOrg = await ClientOrganization.findOne({ clientId: 'test-client-id' });
  if (!clientOrg) {
    throw new Error('Test Client Organization not found. Please run seeder.');
  }
  return clientOrg._id.toString();
};

exports.testFundWallet = async (req, res) => {
  try {
    const { amount, reference } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'];
    const organizationId = await getTestClientOrgId();

    const result = await billingService.fundWallet(organizationId, amount, reference || `TEST_FUND_${Date.now()}`, idempotencyKey);
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.testGetBalance = async (req, res) => {
  try {
    const organizationId = await getTestClientOrgId();
    const balance = await billingService.getBalance(organizationId);
    res.json({ status: 'success', data: { balance } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.testGetHistory = async (req, res) => {
  try {
    const organizationId = await getTestClientOrgId();
    const { page, limit } = req.query;
    const history = await billingService.getHistory(organizationId, page, limit);
    res.json({ status: 'success', data: history });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};