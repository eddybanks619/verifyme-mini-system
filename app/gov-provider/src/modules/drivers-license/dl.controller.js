const DriversLicense = require('./dl.model');

exports.verifyDL = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await DriversLicense.findOne({ licenseNumber: id });
    
    if (!record) {
      return res.status(404).json({ status: 'error', message: 'Drivers License not found' });
    }
    
    res.json({ status: 'success', data: record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};