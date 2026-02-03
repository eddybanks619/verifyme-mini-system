const AuditLog = require('../../models/AuditLog.model');

exports.getOrganizationLogs = async (req, res) => {
  try {
    const organizationId = req.organization._id;
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch logs for this specific organization only
    const logs = await AuditLog.find({ organizationId })
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v -organizationId'); // Exclude internal fields

    // Get total count for pagination metadata
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
        searchId: log.searchId, // In a real app, you might mask this too
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