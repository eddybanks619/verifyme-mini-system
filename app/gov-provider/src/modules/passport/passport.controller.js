const Passport = require('./passport.model');

exports.verifyPassport = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Passport.findOne({ passportNumber: id });
    
    if (!record) {
      return res.status(404).json({ status: 'error', message: 'Passport not found' });
    }
    
    res.json({ status: 'success', data: record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};