const BVN = require('./bvn.model');

exports.verifyBVN = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await BVN.findOne({ bvn: id });
    
    if (!record) {
      return res.status(404).json({ status: 'error', message: 'BVN not found' });
    }
    
    res.json({ status: 'success', data: record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};