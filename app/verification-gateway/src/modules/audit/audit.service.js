const VerificationLog = require('../../models/verification-log.model');
const moment = require('moment');

class AuditService {
  async getHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const logs = await VerificationLog.find({})
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await VerificationLog.countDocuments({});

    const formattedLogs = logs.map(log => {
      const logObj = log.toObject();
      return {
        ...logObj,
        requestedAt: moment(log.requestedAt).format('DD-MM-YYYY')
      };
    });

    return {
      logs: formattedLogs,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new AuditService();