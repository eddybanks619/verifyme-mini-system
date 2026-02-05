const passportService = require('./passport.service');

exports.verifyPassport = async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;

  try {
    const result = await passportService.verify(id, mode, purpose, organization);
    
    if (!result.found) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Passport not found' });
    }
    
    res.json({ status: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
  }
};