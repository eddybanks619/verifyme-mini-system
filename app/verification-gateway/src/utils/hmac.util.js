const crypto = require('crypto');

// In a real scenario, this secret would be shared securely
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'simulated-signature';

const verifyWebhookSignature = (payload, signature) => {
  // For the simulation, we just check if the signature matches our hardcoded secret
  // In production, you would HMAC the payload with the secret
  return signature === WEBHOOK_SECRET;
};

module.exports = {
  verifyWebhookSignature
};