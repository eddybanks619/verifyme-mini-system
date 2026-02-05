const verificationService = require('./verification.service');

exports.verifyIdentity = async (req, res) => {
  const { type, id, mode, purpose } = req.body;

  try {
    const result = await verificationService.verifyIdentity(type, id, mode, purpose);

    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }

    res.json({
      status: 'success',
      data: result.data
    });

  } catch (error) {
    console.error(error);
    
    const statusCode = error.statusCode || 500;
    const responseMessage = error.statusCode ? error.message : 'Verification service error';
    
    res.status(statusCode).json({ 
      status: 'error', 
      code: error.code,
      message: responseMessage 
    });
  }
};