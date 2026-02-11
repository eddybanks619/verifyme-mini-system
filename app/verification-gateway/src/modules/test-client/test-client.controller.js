const verificationService = require('../verification/service/verification.service');
const ClientOrganization = require('../../models/ClientOrganization.model');

exports.testVerify = async (req, res) => {
  try {
    // 1. Fetch the hardcoded test client organization from the database
    const testClient = await ClientOrganization.findOne({ clientId: 'test-client-id' });
    if (!testClient) {
      return res.status(404).json({ status: 'error', message: 'Test client organization not found in database. Please ensure it is seeded.' });
    }

    // 2. Get the verification details from the request body
    const { type, id, mode, purpose } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'] || `test-${Date.now()}`; // Generate a key if not provided

    // 3. Call the verification service, passing the test client organization
    const result = await verificationService.verifyIdentity(type, id, mode, purpose, testClient, idempotencyKey);

    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }

    res.json({
      status: 'success',
      data: result.data
    });

  } catch (error) {
    console.error('Test Client Error:', error);
    
    let statusCode = 500;
    if (error.code) {
      switch (error.code) {
        case 'BILLING402':
          statusCode = 402;
          break;
        case 'BILLING403':
          statusCode = 403;
          break;
        case 'BILLING404':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }
    }
    
    res.status(statusCode).json({ 
      status: 'error', 
      code: error.code || 'SERVER_ERROR',
      message: error.message 
    });
  }
};