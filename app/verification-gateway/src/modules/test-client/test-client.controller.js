const verificationService = require('../verification/service/verification.service');
const ClientOrganization = require('../../models/ClientOrganization.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const POLLING_INTERVAL_MS = 1000;
const POLLING_TIMEOUT_MS = 30000;

exports.testVerify = asyncHandler(async (req, res) => {

  const testClient = await ClientOrganization.findOne({ clientId: 'test-client-id' });
  if (!testClient) {
    throw new AppError('Test client organization not found. Please ensure it is seeded.', 404, 'NOT_FOUND');
  }

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

  const verificationId = result.job._id;

  const pollForStatus = new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const statusResult = await verificationService.getJobStatus(verificationId, testClient);
        if (statusResult.status === 'COMPLETED' || statusResult.status === 'FAILED') {
          clearInterval(interval);
          resolve(statusResult);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, POLLING_INTERVAL_MS);

    setTimeout(() => {
      clearInterval(interval);
      reject(new AppError('Polling timed out after 30 seconds.', 504, 'GATEWAY_TIMEOUT'));
    }, POLLING_TIMEOUT_MS);
  });

  const finalResult = await pollForStatus;
  res.status(200).json(finalResult);
});