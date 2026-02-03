const VerificationLog = require('../../models/verification-log.model');

exports.getVerificationHistory = async (req, res) => {
  try {
    // In a real multi-tenant app, you would filter by an authenticated client/organization ID.
    // For now, we will return all logs.
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const logs = await VerificationLog.find({})
      .sort({ requestedAt: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude internal fields

    const total = await VerificationLog.countDocuments({});

    res.json({
      status: 'success',
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: logs
    });

  } catch (error) {
    console.error('History Log Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve verification history' 
    });
  }
};