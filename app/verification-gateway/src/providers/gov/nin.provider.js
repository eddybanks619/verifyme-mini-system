const axios = require('axios');
const crypto = require('crypto');

class NINProvider {
  constructor() {
    this.baseUrl = process.env.GOV_PROVIDER_URL;
    this.clientId = process.env.GOV_CLIENT_ID || 'gov-client-id';
    this.clientSecret = process.env.GOV_CLIENT_SECRET || 'gov-secret-key';
  }

  // The gov-provider expects the signature to be generated from a string: "clientId.timestamp"
  generateSignature(timestamp) {
    const payloadString = `${this.clientId}.${timestamp}`;
    return crypto
      .createHmac('sha256', this.clientSecret)
      .update(payloadString)
      .digest('hex');
  }

  async verify(id, mode = 'basic_identity', purpose = 'IDENTITY_VERIFICATION') {
    try {
      const timestamp = Date.now().toString();
      const requestBody = {
        id,
        mode,
        purpose,
        consent: true
      };
      // Generate signature using only clientId and timestamp, as expected by gov-provider
      const signature = this.generateSignature(timestamp);
      const idempotencyKey = crypto.randomUUID(); // Generate a unique key for this request

      const response = await axios.post(`${this.baseUrl}/api/v1/nin/verify`, requestBody, {
        headers: { 
          'x-client-id': this.clientId,
          'x-timestamp': timestamp,
          'x-signature': signature,
          'x-idempotency-key': idempotencyKey
        }
      });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) return null;
        
        const customError = new Error(error.response.data.message || error.response.statusText);
        customError.statusCode = error.response.status;
        customError.code = error.response.data.code;
        throw customError;
      }
      throw new Error(`NIN Verification failed: ${error.message}`);
    }
  }
}

module.exports = new NINProvider();
