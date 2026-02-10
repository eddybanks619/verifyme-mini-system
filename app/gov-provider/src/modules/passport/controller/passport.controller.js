const passportService = require('../service/passport.service');

exports.verifyPassport = async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;
  const idempotencyKey = req.headers['x-idempotency-key'];

  try {
    const result = await passportService.verify(id, mode, purpose, organization, idempotencyKey);
    
    if (!result.found) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Passport not found' });
    }
    
    res.json({ status: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    if (error.code === 'BILLING402') {
      return res.status(402).json({ code: 'BILLING402', message: error.message });
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
  }
};