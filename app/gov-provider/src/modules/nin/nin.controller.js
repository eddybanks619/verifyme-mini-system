const NIN = require('./nin.model');

exports.verifyNIN = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await NIN.findOne({ nin: id });
    
    if (!record) {
      return res.status(404).json({ status: 'error', message: 'NIN not found' });
    }
    
    res.json({ status: 'success', data: record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};