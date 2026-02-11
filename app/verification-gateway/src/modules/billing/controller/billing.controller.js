const billingService = require('../service/billing.service');

exports.fundWallet = async (req, res) => {
  try {
    const { amount, reference } = req.body;
    const organizationId = req.clientOrganization._id.toString(); // From auth middleware

    const result = await billingService.fundWallet(organizationId, amount, reference);
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const organizationId = req.clientOrganization._id.toString();
    const balance = await billingService.getBalance(organizationId);
    res.json({ status: 'success', data: { balance } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const organizationId = req.clientOrganization._id.toString();
    const { page, limit } = req.query;
    const history = await billingService.getHistory(organizationId, page, limit);
    res.json({ status: 'success', data: history });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};