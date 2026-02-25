const verificationService = require('../verification/service/verification.service');
const ClientOrganization = require('../../models/ClientOrganization.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

// 1. Queue the Verification Job
exports.testVerify = asyncHandler(async (req, res) => {
  // Fetch the hardcoded test client organization
  const testClient = await ClientOrganization.findOne({ clientId: 'test-client-id' });
  if (!testClient) {
    throw new AppError('Test client organization not found. Please ensure it is seeded.', 404, 'NOT_FOUND');
  }

  // Queue the verification job
  const { type, id, mode, purpose } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'] || `test-${Date.now()}`;

  const result = await verificationService.createVerificationJob({
    type,
    id,
    mode,
    purpose,
    clientOrganization: testClient,
    idempotencyKey,
  });

  if (result.isDuplicate) {
    return res.status(200).json({
      status: result.job.status,
      message: 'This request has already been processed. Returning existing status.',
      verificationId: result.job._id,
      identity: result.job.searchId,
    });
  }

  res.status(202).json({
    status: 'PENDING',
    message: 'Verification request has been accepted and is being processed.',
    verificationId: result.job._id,
    identity: id,
  });
});

// 2. Check the Status of a Job
exports.testCheckStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Fetch the hardcoded test client organization again for authorization check
  const testClient = await ClientOrganization.findOne({ clientId: 'test-client-id' });
  if (!testClient) {
    throw new AppError('Test client organization not found.', 404, 'NOT_FOUND');
  }

  const statusResult = await verificationService.getJobStatus(id, testClient);

  res.status(200).json(statusResult);
});