const ninProvider = require('../../providers/gov/nin.provider');
const bvnProvider = require('../../providers/gov/bvn.provider');
const passportProvider = require('../../providers/gov/passport.provider');
const dlProvider = require('../../providers/gov/dl.provider');
const normalizer = require('../../normalizers/identity.normalizer');
const VerificationLog = require('../../models/verification-log.model');

exports.verifyIdentity = async (req, res) => {
  const { type, id, mode, purpose } = req.body;
  let status = 'FAILED';
  let rawData = null;
  let normalizedData = null;
  let errorMessage = null;

  try {
    switch (type.toUpperCase()) {
      case 'NIN':
        rawData = await ninProvider.verify(id, mode, purpose);
        break;
      case 'BVN':
        rawData = await bvnProvider.verify(id, mode, purpose);
        break;
      case 'PASSPORT':
        rawData = await passportProvider.verify(id, mode, purpose);
        break;
      case 'DRIVERS_LICENSE':
        rawData = await dlProvider.verify(id, mode, purpose);
        break;
      default:
        throw new Error('Invalid verification type');
    }

    if (!rawData) {
      status = 'NOT_FOUND';
      errorMessage = 'Identity not found';
      return res.status(404).json({ status: 'error', message: errorMessage });
    }

    normalizedData = await normalizer.normalize(type.toUpperCase(), rawData);
    status = 'SUCCESS';

    res.json({
      status: 'success',
      data: normalizedData
    });

  } catch (error) {
    console.error(error);
    errorMessage = error.message;

    // Use the propagated status code if it exists, otherwise default to 500
    const statusCode = error.statusCode || 500;
    const responseMessage = error.statusCode ? error.message : 'Verification service error';
    
    res.status(statusCode).json({ 
      status: 'error', 
      code: error.code,
      message: responseMessage 
    });

  } finally {
    // Log the verification attempt
    try {
      const logPayload = { ...normalizedData };
      if (logPayload && logPayload.photo) {
        logPayload.photo = '[BASE64_IMAGE_TRUNCATED]';
      }

      await VerificationLog.create({
        verificationType: type.toUpperCase(),
        searchId: id,
        status,
        responsePayload: logPayload,
        errorMessage
      });
    } catch (logError) {
      console.error('Logging failed:', logError);
    }
  }
};