const billingService = require('../service/billing.service');

// --- TEMPORARY: Hardcode clientOrganization for testing without auth ---
// In a real scenario, this would come from req.clientOrganization after authentication.
// Make sure this _id matches a wallet you've seeded (e.g., 'test-client-id' from seeder)
const TEMP_CLIENT_ORG_ID = '65c711211111111111111111'; // Replace with a valid _id from your ClientOrganization collection
// --- END TEMPORARY ---

exports.fundWallet = async (req, res) => {
  try {
    const { amount, reference } = req.body;
    // const organizationId = req.clientOrganization._id.toString(); // Original line
    const organizationId = TEMP_CLIENT_ORG_ID; // Temporary hardcode

    const result = await billingService.fundWallet(organizationId, amount, reference);
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    // const organizationId = req.clientOrganization._id.toString(); // Original line
    const organizationId = TEMP_CLIENT_ORG_ID; // Temporary hardcode
    const balance = await billingService.getBalance(organizationId);
    res.json({ status: 'success', data: { balance } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // const organizationId = req.clientOrganization._id.toString(); // Original line
    const organizationId = TEMP_CLIENT_ORG_ID; // Temporary hardcode
    const { page, limit } = req.query;
    const history = await billingService.getHistory(organizationId, page, limit);
    res.json({ status: 'success', data: history });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};