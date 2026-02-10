const verificationService = require('../service/verification.service');

exports.verifyIdentity = async (req, res) => {
  const { type, id, mode, purpose } = req.body;
  // const clientOrganization = req.clientOrganization; // Original line
  const idempotencyKey = req.headers['x-idempotency-key'];

  // --- TEMPORARY: Hardcode clientOrganization for testing without auth ---
  // In a real scenario, this would come from req.clientOrganization after authentication.
  // Make sure this _id matches a wallet you've seeded (e.g., 'test-client-id' from seeder)
  const clientOrganization = {
    _id: '65c711211111111111111111', // Replace with a valid _id from your ClientOrganization collection
    clientId: 'test-client-id',
    name: 'Test Client App'
  };
  // --- END TEMPORARY ---

  try {
    const result = await verificationService.verifyIdentity(type, id, mode, purpose, clientOrganization, idempotencyKey);

    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }

    res.json({
      status: 'success',
      data: result.data
    });

  } catch (error) {
    console.error(error);
    
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
        case 'AUTH403':
          statusCode = 403;
          break;
        default:
          statusCode = 500;
      }
    }
    
    const responseMessage = error.message || 'Verification service error';
    
    res.status(statusCode).json({ 
      status: 'error', 
      code: error.code || 'SERVER_ERROR',
      message: responseMessage 
    });
  }
};