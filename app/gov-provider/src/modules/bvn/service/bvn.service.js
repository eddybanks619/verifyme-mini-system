const BVN = require('../data/bvn.model');
const { maskData } = require('../../../privacy/masking.util');
const AuditLog = require('../../../models/AuditLog.model');

class BVNService {
  async verify(id, mode, purpose, organization) {
    let status = 'FAILED';
    let fieldsAccessed = [];
    let responseData = null;

    try {
      const record = await BVN.findOne({ bvn: id });

      if (!record) {
        status = 'NOT_FOUND';
        await this.logAudit(organization._id, id, purpose, mode, status, []);
        return { found: false };
      }

      responseData = maskData(record, mode);
      status = 'FOUND';
      fieldsAccessed = Object.keys(responseData);

      await this.logAudit(organization._id, id, purpose, mode, status, fieldsAccessed);

      return { found: true, data: responseData };
    } catch (error) {
      throw error;
    }
  }

  async logAudit(organizationId, searchId, purpose, mode, status, fieldsAccessed) {
    return AuditLog.create({
      organizationId,
      verificationType: 'BVN',
      searchId,
      purpose,
      mode,
      status,
      fieldsAccessed
    });
  }
}

module.exports = new BVNService();