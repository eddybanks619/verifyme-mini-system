const ninService = require('./nin.service');

exports.verifyNIN = async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;

  try {
    const result = await ninService.verify(id, mode, purpose, organization);
    
    if (!result.found) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'NIN not found' });
    }
    
    res.json({ status: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
  }
};