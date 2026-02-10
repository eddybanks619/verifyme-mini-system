const ClientOrganization = require('../models/ClientOrganization.model');
const crypto = require('crypto');

const verifySignature = (payload, secret, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

const authenticateClient = async (req, res, next) => {
  try {
    const clientId = req.headers['x-client-id'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!clientId || !signature || !timestamp) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'MISSING AUTHENTICATION HEADERS (x-client-id, x-timestamp, x-signature)'
      });
    }

    const clientOrganization = await ClientOrganization.findOne({ clientId });

    if (!clientOrganization) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'INVALID CLIENT ID'
      });
    }

    if (clientOrganization.status !== 'ACTIVE') {
      return res.status(403).json({
        code: 'AUTH403',
        message: 'CLIENT ORGANIZATION SUSPENDED'
      });
    }

    const payload = { clientId, timestamp };
    const isValid = verifySignature(payload, clientOrganization.clientSecret, signature);

    if (!isValid) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'INVALID SIGNATURE'
      });
    }

    req.clientOrganization = clientOrganization; // Attach client organization to request
    next();
  } catch (error) {
    console.error('Client Authentication Error:', error);
    res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'INTERNAL SERVER ERROR'
    });
  }
};

module.exports = authenticateClient;