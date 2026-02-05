const AuditLog = require('../../models/AuditLog.model');

exports.getOrganizationLogs = async (req, res) => {
  try {
    const organizationId = req.organization._id;
    const { page = 1, limit = 20 } = req.query;


    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ organizationId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v -organizationId');


    const total = await AuditLog.countDocuments({ organizationId });

    res.json({
      status: 'success',
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: logs.map(log => ({
        id: log._id,
        type: log.verificationType,
        searchId: log.searchId,
        purpose: log.purpose,
        mode: log.mode,
        status: log.status,
        fieldsAccessed: log.fieldsAccessed,
        timestamp: log.timestamp
      }))
    });

  } catch (error) {
    console.error('Audit Log Error:', error);
    res.status(500).json({ 
      code: 'SERVER_ERROR', 
      message: 'Failed to retrieve audit logs' 
    });
  }
};