const ninProvider = require('../../providers/gov/nin.provider');
const bvnProvider = require('../../providers/gov/bvn.provider');
const passportProvider = require('../../providers/gov/passport.provider');
const dlProvider = require('../../providers/gov/dl.provider');
const normalizer = require('../../normalizers/identity.normalizer');
const VerificationLog = require('../../models/verification-log.model');

exports.verifyIdentity = async (req, res) => {
  const { type, id } = req.body;
  let status = 'FAILED';
  let rawData = null;
  let normalizedData = null;
  let errorMessage = null;

  try {
    switch (type.toUpperCase()) {
      case 'NIN':
        rawData = await ninProvider.verify(id);
        break;
      case 'BVN':
        rawData = await bvnProvider.verify(id);
        break;
      case 'PASSPORT':
        rawData = await passportProvider.verify(id);
        break;
      case 'DRIVERS_LICENSE':
        rawData = await dlProvider.verify(id);
        break;
      default:
        throw new Error('Invalid verification type');
    }

    if (!rawData) {
      status = 'NOT_FOUND';
      errorMessage = 'Identity not found';
      return res.status(404).json({ status: 'error', message: errorMessage });
    }

    normalizedData = normalizer.normalize(type.toUpperCase(), rawData);
    status = 'SUCCESS';

    res.json({
      status: 'success',
      data: normalizedData
    });

  } catch (error) {
    console.error(error);
    errorMessage = error.message;
    res.status(500).json({ status: 'error', message: 'Verification service error' });
  } finally {
    // Log the verification attempt
    try {
      await VerificationLog.create({
        verificationType: type.toUpperCase(),
        searchId: id,
        status,
        responsePayload: normalizedData,
        errorMessage
      });
    } catch (logError) {
      console.error('Logging failed:', logError);
    }
  }
};