const verificationService = require('../verification/service/verification.service');
const ClientOrganization = require('../../models/ClientOrganization.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

exports.testVerify = asyncHandler(async (req, res) => {
  // 1. Fetch the hardcoded test client organization from the database
  const testClient = await ClientOrganization.findOne({ clientId: 'test-client-id' });
  if (!testClient) {
    throw new AppError('Test client organization not found in database. Please ensure it is seeded.', 404, 'NOT_FOUND');
  }

  // 2. Get the verification details from the request body
  const { type, id, mode, purpose } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'] || `test-${Date.now()}`; // Generate a key if not provided

  // 3. Call the verification service, passing the test client organization
  const result = await verificationService.verifyIdentity(type, id, mode, purpose, testClient, idempotencyKey);

  res.json({
    status: 'success',
    data: result.data
  });
});