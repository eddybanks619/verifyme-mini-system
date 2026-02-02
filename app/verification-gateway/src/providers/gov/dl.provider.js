const axios = require('axios');

class DLProvider {
  constructor() {
    this.baseUrl = process.env.GOV_PROVIDER_URL;
    this.apiKey = process.env.GOV_API_KEY;
  }

  async verify(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/drivers-license/${id}`, {
        headers: { 'x-api-key': this.apiKey }
      });
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Drivers License Verification failed: ${error.message}`);
    }
  }
}

module.exports = new DLProvider();