const Passport = require('./passport.model');
const { maskData } = require('../../privacy/masking.util');
const AuditLog = require('../../models/AuditLog.model');

exports.verifyPassport = async (req, res) => {
  const { id, mode, purpose } = req.body;
  const organization = req.organization;
  let status = 'FAILED';
  let fieldsAccessed = [];

  try {
    const record = await Passport.findOne({ passportNumber: id });
    
    if (!record) {
      status = 'NOT_FOUND';
      await AuditLog.create({
        organizationId: organization._id,
        verificationType: 'PASSPORT',
        searchId: id,
        purpose,
        mode,
        status
      });
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Passport not found' });
    }
    
    const responseData = maskData(record, mode);
    status = 'SUCCESS';
    fieldsAccessed = Object.keys(responseData);

    await AuditLog.create({
      organizationId: organization._id,
      verificationType: 'PASSPORT',
      searchId: id,
      purpose,
      mode,
      status,
      fieldsAccessed
    });

    res.json({ status: 'success', data: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
  }
};