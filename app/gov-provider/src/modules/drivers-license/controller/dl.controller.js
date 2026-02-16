const dlService = require('../service/dl.service');
const asyncHandler = require('../../../utils/asyncHandler');

exports.verifyDL = asyncHandler(async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;
  const idempotencyKey = req.headers['x-idempotency-key'];

  const result = await dlService.verify(id, mode, purpose, organization, idempotencyKey);
  
  res.json({ status: 'success', data: result.data });
});