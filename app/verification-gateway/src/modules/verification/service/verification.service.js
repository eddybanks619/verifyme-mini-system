const ninProvider = require('../../../providers/gov/nin.provider');
const bvnProvider = require('../../../providers/gov/bvn.provider');
const passportProvider = require('../../../providers/gov/passport.provider');
const dlProvider = require('../../../providers/gov/dl.provider');
const normalizer = require('../../../normalizers/identity.normalizer');
const VerificationLog = require('../../../models/verification-log.model');
const billingService = require('../../billing/service/billing.service');
const AppError = require('../../../utils/AppError');

class VerificationService {
  async verifyIdentity(type, id, mode, purpose, clientOrganization, idempotencyKey) {
    // 1. Charge the gateway's client
    const billingResult = await billingService.chargeWallet(
      clientOrganization._id.toString(),
      type.toUpperCase(),
      idempotencyKey
    );

    if (!billingResult.success) {
      let statusCode = 500;
      let errorCode = 'BILLING500';

      switch (billingResult.error) {
        case 'INSUFFICIENT_FUNDS':
          statusCode = 402;
          errorCode = 'BILLING402';
          break;
        case 'WALLET_SUSPENDED':
          statusCode = 403;
          errorCode = 'BILLING403';
          break;
        case 'WALLET_NOT_FOUND':
          statusCode = 404;
          errorCode = 'BILLING404';
          break;
        default:
          statusCode = 500;
          errorCode = 'BILLING500';
      }

      throw new AppError(billingResult.message || 'Billing failed', statusCode, errorCode);
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
          throw new AppError('Invalid verification type', 400, 'INVALID_TYPE');
      }

      if (!rawData) {
        status = 'NOT_FOUND';
        errorMessage = 'Identity not found';
        await this.logVerification(type, id, status, null, errorMessage);
        throw new AppError(errorMessage, 404, 'NOT_FOUND');
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