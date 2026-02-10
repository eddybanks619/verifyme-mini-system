const verificationService = require('./verification.service');

exports.verifyIdentity = async (req, res) => {
  const { type, id, mode, purpose } = req.body;

  try {
    const result = await verificationService.verifyIdentity(type, id, mode, purpose);

    if (!result.success) {
      // This case now specifically handles "NOT_FOUND" from the service layer
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
        case 'BILLING402': // Insufficient Funds
          statusCode = 402; // Payment Required
          break;
        case 'BILLING403': // Wallet Suspended
          statusCode = 403; // Forbidden
          break;
        case 'BILLING404': // Wallet Not Found
          statusCode = 404; // Not Found
          break;
        // Add other specific billing or auth codes from gov-provider here
        case 'AUTH403': // e.g., Mode Not Permitted
          statusCode = 403;
          break;
        default:
          statusCode = 500;
      }
    }
    
    // Use the specific error message propagated from the provider
    const responseMessage = error.message || 'Verification service error';
    
    res.status(statusCode).json({ 
      status: 'error', 
      code: error.code || 'SERVER_ERROR',
      message: responseMessage 
    });
  }
};