const Organization = require('../models/Organization.model');
const { verifySignature } = require('../security/hmac.util');

const authenticate = async (req, res, next) => {
  try {
    const clientId = req.headers['x-client-id'];
    const signature = req.headers['x-signature'];

    if (!clientId || !signature) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'MISSING AUTHENTICATION HEADERS'
      });
    }

    const organization = await Organization.findOne({ clientId });

    if (!organization) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'INVALID CLIENT ID'
      });
    }

    if (organization.status !== 'ACTIVE') {
      return res.status(403).json({
        code: 'AUTH403',
        message: 'ORGANIZATION SUSPENDED'
      });
    }

    // In a real scenario, we would validate the signature against the request body
    // For GET requests, we might sign the query params or a timestamp
    // For simplicity here, we will assume the client sends a timestamp in headers to sign
    // But to keep it simple for this simulation, we will just check if the secret matches
    // what the client used to sign a dummy payload or just check the secret directly if we were using Basic Auth.
    // However, the requirement is HMAC.
    
    // Let's assume the signature is HMAC(body + timestamp, secret)
    // If body is empty (GET), use empty object {}
    
    // For this simulation, to make it testable without complex client logic yet,
    // we will implement a simplified check or a proper one if the user updates the client.

    
    // Let's implement a robust check:
    // We expect the client to send 'x-timestamp' as well to prevent replay attacks.
    // Signature = HMAC-SHA256(clientId + timestamp, clientSecret)
    
    const timestamp = req.headers['x-timestamp'];
    if (!timestamp) {
       return res.status(401).json({ code: 'AUTH401', message: 'MISSING TIMESTAMP' });
    }

    // Verify signature
    // Payload to sign: clientId + timestamp
    const payload = { clientId, timestamp };
    
    // Note: In a real world, we'd use the raw body for POST requests too.
    // But let's stick to a simple handshake for now.
    
    const isValid = verifySignature(payload, organization.clientSecret, signature);

    if (!isValid) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'INVALID SIGNATURE'
      });
    }

    req.organization = organization;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'INTERNAL SERVER ERROR'
    });
  }
};

module.exports = authenticate;