const dlService = require('../service/dl.service');

exports.verifyDL = async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;

  try {
    const result = await dlService.verify(id, mode, purpose, organization);
    
    if (!result.found) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Drivers License not found' });
    }
    
    res.json({ status: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
  }
};