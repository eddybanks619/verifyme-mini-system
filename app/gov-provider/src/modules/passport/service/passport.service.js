const Passport = require('./passport.model');
const { maskData } = require('../../../privacy/masking.util');
const AuditLog = require('../../../models/AuditLog.model');
const billingService = require('../../billing/service/billing.service');

class PassportService {
  async verify(id, mode, purpose, organization, idempotencyKey) {
    const billingResult = await billingService.chargeWallet(
      organization._id.toString(), 
      'PASSPORT', 
      idempotencyKey
    );

    if (!billingResult.success) {
      if (billingResult.error === 'INSUFFICIENT_FUNDS') {
        const error = new Error('Insufficient funds');
        error.code = 'BILLING402';
        throw error;
      }
      throw new Error('Billing failed');
    }

    try {
      const record = await Passport.findOne({ passportNumber: id });

      if (!record) {
        await this.logAudit(organization._id, id, purpose, mode, 'NOT_FOUND', []);
        return { found: false };
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