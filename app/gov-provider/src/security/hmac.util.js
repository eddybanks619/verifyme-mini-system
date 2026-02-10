const crypto = require('crypto');

// Now expects payload to be a string directly
const generateSignature = (payloadString, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
};

// Now expects payload to be a string directly
const verifySignature = (payloadString, secret, signature) => {
  const expectedSignature = generateSignature(payloadString, secret);
  // Use crypto.timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'), // Ensure signature is treated as hex
    Buffer.from(expectedSignature, 'hex') // Ensure expectedSignature is treated as hex
  );
};

module.exports = {
  generateSignature,
  verifySignature
};