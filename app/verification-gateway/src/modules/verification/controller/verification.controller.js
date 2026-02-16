const verificationService = require('../service/verification.service');
const asyncHandler = require('../../../utils/asyncHandler');

exports.verifyIdentity = asyncHandler(async (req, res) => {
  const { type, id, mode, purpose } = req.body;
  const clientOrganization = req.clientOrganization; // From authenticateClient middleware
  const idempotencyKey = req.headers['x-idempotency-key'];

  const result = await verificationService.verifyIdentity(type, id, mode, purpose, clientOrganization, idempotencyKey);

  res.json({
    status: 'success',
    data: result.data
  });
});