const verificationService = require('../service/verification.service');

exports.verifyIdentity = async (req, res) => {
  const { type, id, mode, purpose } = req.body;
  const clientOrganization = req.clientOrganization; // From authenticateClient middleware
  const idempotencyKey = req.headers['x-idempotency-key'];

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