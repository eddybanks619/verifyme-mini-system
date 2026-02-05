const VerificationLog = require('../../models/verification-log.model');
const moment = require('moment');

exports.getVerificationHistory = async (req, res) => {
  try {

    const { page = 1, limit = 20 } = req.query;

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

    res.json({
      status: 'success',
      meta: {
        total,
        // page: parseInt(page),
        // limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: formattedLogs
    });

  } catch (error) {
    console.error('History Log Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve verification history' 
    });
  }
};