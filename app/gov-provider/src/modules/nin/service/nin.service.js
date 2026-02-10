const NIN = require('./nin.model');
const { maskData } = require('../../../privacy/masking.util');
const AuditLog = require('../../../models/AuditLog.model');
const billingService = require('../../billing/service/billing.service');

class NINService {
  async verify(id, mode, purpose, organization, idempotencyKey) {
    const billingResult = await billingService.chargeWallet(
      organization._id.toString(), 
      'NIN', 
      idempotencyKey
    );

    if (!billingResult.success) {
      const error = new Error(billingResult.message || 'Billing failed');
      
      switch (billingResult.error) {
        case 'INSUFFICIENT_FUNDS':
          error.code = 'BILLING402';
          break;
        case 'WALLET_SUSPENDED':
          error.code = 'BILLING403';
          break;
        case 'WALLET_NOT_FOUND':
          error.code = 'BILLING404';
          break;
        default:
          error.code = 'BILLING500';
      }
      throw error;
    }

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