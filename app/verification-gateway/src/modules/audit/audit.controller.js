const auditService = require('./audit.service');

exports.getVerificationHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await auditService.getHistory(page, limit);

    res.json({
      status: 'success',
      meta: result.meta,
      data: result.logs
    });

  } catch (error) {
    console.error('History Log Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve verification history' 
    });
  }
};