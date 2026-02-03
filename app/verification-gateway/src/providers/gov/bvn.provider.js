const axios = require('axios');
const crypto = require('crypto');

class BVNProvider {
  constructor() {
    this.baseUrl = process.env.GOV_PROVIDER_URL;
    this.clientId = process.env.GOV_CLIENT_ID || 'gov-client-id';
    this.clientSecret = process.env.GOV_CLIENT_SECRET || 'gov-secret-key';
  }

  generateSignature(payload, timestamp) {
    const dataToSign = { clientId: this.clientId, timestamp };
    return crypto
      .createHmac('sha256', this.clientSecret)
      .update(JSON.stringify(dataToSign))
      .digest('hex');
  }

  async verify(id) {
    try {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature({}, timestamp);

      const response = await axios.get(`${this.baseUrl}/api/v1/bvn/${id}`, {
        headers: { 
          'x-client-id': this.clientId,
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) return null;
        throw new Error(`Gov Provider Error: ${error.response.data.message || error.response.statusText}`);
      }
      throw new Error(`BVN Verification failed: ${error.message}`);
    }
  }
}

module.exports = new BVNProvider();