const ninService = require('../service/nin.service');
const asyncHandler = require('../../../utils/asyncHandler');

exports.verifyNIN = asyncHandler(async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;
  const idempotencyKey = req.headers['x-idempotency-key'];

  const result = await ninService.verify(id, mode, purpose, organization, idempotencyKey);
  
  res.json({ status: 'success', data: result.data });
});