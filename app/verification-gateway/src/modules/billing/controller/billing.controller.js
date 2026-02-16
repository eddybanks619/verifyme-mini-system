const billingService = require('../service/billing.service');
const asyncHandler = require('../../../utils/asyncHandler');

exports.fundWallet = asyncHandler(async (req, res) => {
  const { amount, reference } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'];
  const organizationId = req.clientOrganization._id.toString(); // From auth middleware

  const result = await billingService.fundWallet(organizationId, amount, reference, idempotencyKey);
  res.json({ status: 'success', data: result });
});

exports.getBalance = asyncHandler(async (req, res) => {
  const organizationId = req.clientOrganization._id.toString();
  const balance = await billingService.getBalance(organizationId);
  res.json({ status: 'success', data: { balance } });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const organizationId = req.clientOrganization._id.toString();
  const { page, limit } = req.query;
  const history = await billingService.getHistory(organizationId, page, limit);
  res.json({ status: 'success', data: history });
});