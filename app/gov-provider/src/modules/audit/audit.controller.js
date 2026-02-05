const auditService = require('./audit.service');

exports.getOrganizationLogs = async (req, res) => {
  try {
    const organizationId = req.organization._id;
    const { page, limit } = req.query;

    const result = await auditService.getLogs(organizationId, page, limit);

    res.json({
      status: 'success',
      meta: result.meta,
      data: result.logs
    });

  } catch (error) {
    console.error('Audit Log Error:', error);
    res.status(500).json({ 
      code: 'SERVER_ERROR', 
      message: 'Failed to retrieve audit logs' 
    });
  }
};