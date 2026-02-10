const ninProvider = require('../../../providers/gov/nin.provider');
const bvnProvider = require('../../../providers/gov/bvn.provider');
const passportProvider = require('../../../providers/gov/passport.provider');
const dlProvider = require('../../../providers/gov/dl.provider');
const normalizer = require('../../../normalizers/identity.normalizer');
const VerificationLog = require('../../../models/verification-log.model');
const billingService = require('../../billing/service/billing.service');

class VerificationService {
  async verifyIdentity(type, id, mode, purpose, clientOrganization, idempotencyKey) {
    // 1. Charge the gateway's client
    const billingResult = await billingService.chargeWallet(
      clientOrganization._id.toString(),
      type.toUpperCase(),
      idempotencyKey
    );

    if (!billingResult.success) {
      const error = new Error(billingResult.message || 'Billing failed');
      error.code = billingResult.error === 'INSUFFICIENT_FUNDS' ? 'BILLING402' : 'BILLING500';
      throw error;
    }

    // 2. If client billing is successful, proceed to call the gov-provider
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
      status = 'FOUND';

      await this.logVerification(type, id, status, normalizedData, null);

      return { success: true, data: normalizedData };

    } catch (error) {
      errorMessage = error.message;
      // Log the failure before re-throwing
      await this.logVerification(type, id, status, null, errorMessage);
      // Re-throw the error so the controller can handle the specific status code
      throw error;
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