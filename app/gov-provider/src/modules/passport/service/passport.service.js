const Passport = require('../data/passport.model');
const { maskData } = require('../../../privacy/masking.util');
const AuditLog = require('../../../models/AuditLog.model');
const billingService = require('../../billing/service/billing.service');
const AppError = require('../../../utils/AppError');

class PassportService {
  async verify(id, mode, purpose, organization, idempotencyKey) {
    const billingResult = await billingService.chargeWallet(
      organization._id.toString(), 
      'PASSPORT', 
      idempotencyKey
    );

    if (!billingResult.success) {
      let statusCode = 500;
      let errorCode = 'BILLING500';

      switch (billingResult.error) {
        case 'INSUFFICIENT_FUNDS':
          statusCode = 402; // Payment Required
          errorCode = 'BILLING402';
          break;
        case 'WALLET_SUSPENDED':
          statusCode = 403; // Forbidden
          errorCode = 'BILLING403';
          break;
        case 'WALLET_NOT_FOUND':
          statusCode = 404; // Not Found
          errorCode = 'BILLING404';
          break;
        default:
          statusCode = 500;
          errorCode = 'BILLING500';
      }
      
      throw new AppError(billingResult.message || 'Billing failed', statusCode, errorCode);
    }

    try {
      const record = await Passport.findOne({ passportNumber: id });

      if (!record) {
        await this.logAudit(organization._id, id, purpose, mode, 'NOT_FOUND', []);
        throw new AppError('Passport not found', 404, 'NOT_FOUND');
      }

      const responseData = maskData(record, mode);
      const fieldsAccessed = Object.keys(responseData);

      await this.logAudit(organization._id, id, purpose, mode, 'SUCCESS', fieldsAccessed);

      return { found: true, data: responseData };
    } catch (error) {
      throw error;
    }
  }

  async logAudit(organizationId, searchId, purpose, mode, status, fieldsAccessed) {
    return AuditLog.create({
      organizationId,
      verificationType: 'PASSPORT',
      searchId,
      purpose,
      mode,
      status,
      fieldsAccessed
    });
  }
}

module.exports = new PassportService();