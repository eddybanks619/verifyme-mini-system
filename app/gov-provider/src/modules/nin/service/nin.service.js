const NIN = require('./nin.model');
const { maskData } = require('../../../privacy/masking.util');
const AuditLog = require('../../../models/AuditLog.model');
const billingService = require('../../billing/service/billing.service');

class NINService {
  async verify(id, mode, purpose, organization, idempotencyKey) {
    // 1. Charge Wallet
    const billingResult = await billingService.chargeWallet(
      organization._id.toString(), 
      'NIN', 
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

    // 2. Perform Verification
    try {
      const record = await NIN.findOne({ nin: id });

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
      verificationType: 'NIN',
      searchId,
      purpose,
      mode,
      status,
      fieldsAccessed
    });
  }
}

module.exports = new NINService();