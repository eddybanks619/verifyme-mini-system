const ninProvider = require('../../providers/gov/nin.provider');
const bvnProvider = require('../../providers/gov/bvn.provider');
const passportProvider = require('../../providers/gov/passport.provider');
const dlProvider = require('../../providers/gov/dl.provider');
const normalizer = require('../../normalizers/identity.normalizer');
const VerificationLog = require('../../models/verification-log.model');

class VerificationService {
  async verifyIdentity(type, id, mode, purpose) {
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
        await this.logVerification(type, id, status, null, errorMessage);
        return { success: false, code: 'NOT_FOUND', message: errorMessage };
      }

      normalizedData = await normalizer.normalize(type.toUpperCase(), rawData);
      status = 'SUCCESS';

      await this.logVerification(type, id, status, normalizedData, null);

      return { success: true, data: normalizedData };

    } catch (error) {
      errorMessage = error.message;
      // Log the failure
      await this.logVerification(type, id, status, null, errorMessage);
      throw error; // Re-throw to be handled by controller
    }
  }

  async logVerification(type, id, status, data, errorMessage) {
    try {
      const logPayload = data ? { ...data } : null;
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
}

module.exports = new VerificationService();