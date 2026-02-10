const dlService = require('../service/dl.service');

exports.verifyDL = async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;
  const idempotencyKey = req.headers['x-idempotency-key'];

  try {
    const result = await dlService.verify(id, mode, purpose, organization, idempotencyKey);
    
    if (!result.found) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Drivers License not found' });
    }
    
    res.json({ status: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    
    let statusCode = 500;
    if (error.code) {
      switch (error.code) {
        case 'BILLING402':
          statusCode = 402; // Payment Required
          break;
        case 'BILLING403':
          statusCode = 403; // Forbidden
          break;
        case 'BILLING404':
          statusCode = 404; // Not Found
          break;
        default:
          statusCode = 500;
      }
    }
        res.status(statusCode).json({ code: error.code || 'SERVER_ERROR', message: error.message });
  }
};