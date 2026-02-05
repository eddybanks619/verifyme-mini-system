const moment = require('moment');
const axios = require('axios');

class IdentityNormalizer {
  
  formatDate(date) {
    if (!date) return null;
    return moment(date).format('DD-MM-YYYY');
  }

  formatGender(gender) {
    if (!gender) return null;
    const g = gender.toUpperCase();
    if (g === 'M' || g === 'MALE') return 'Male';
    if (g === 'F' || g === 'FEMALE') return 'Female';
    return gender;
  }

  async imageToBase64(url) {
    if (!url) return null;
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const mimeType = response.headers['content-type'];
      return `data:${mimeType};base64,${base64}`;

    } catch (error) {
      console.error('IMAGE TO BASE64 CONVERSION FAILED');
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      if (error.code) console.error('Error Code:', error.code);
      return null;
    }
  }

  async normalize(type, data) {
    const base = {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      dateOfBirth: this.formatDate(data.dateOfBirth),
      verifiedAt: this.formatDate(new Date()),
      verificationType: type,
    };

    let specific = {};

    switch (type) {
      case 'NIN':
        specific = {
          idNumber: data.nin || null,
          middleName: data.middleName || null,
          gender: this.formatGender(data.gender),
          phone: data.phone || null,
          address: data.address || null,
          photo: await this.imageToBase64(data.image)
        };
        break;

      case 'BVN':
        specific = {
          idNumber: data.bvn || null,
          middleName: data.middleName || null,
          phone: data.phone || null,
          enrollmentBank: data.enrollmentBank || null,
          photo: await this.imageToBase64(data.image)
        };
        break;

      case 'PASSPORT':
        specific = {
          idNumber: data.passportNumber || null,
          expiryDate: this.formatDate(data.expiryDate),
          issueDate: this.formatDate(data.issueDate),
          nationality: data.nationality || null,
          photo: null
        };
        break;

      case 'DRIVERS_LICENSE':
        specific = {
          idNumber: data.licenseNumber || null,
          expiryDate: this.formatDate(data.expiryDate),
          issuedDate: this.formatDate(data.issuedDate),
          class: data.class || null,
          stateOfIssue: data.stateOfIssue || null,
          photo: null
        };
        break;
        
      default:
        specific = {};
    }

    return {
      ...base,
      ...specific
    };
  }
}

module.exports = new IdentityNormalizer();