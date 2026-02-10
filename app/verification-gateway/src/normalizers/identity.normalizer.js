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
    if (!url || typeof url !== 'string') return null;

    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        console.warn(`Skipping image conversion: Invalid protocol ${parsedUrl.protocol}`);
        return null;
      }
    } catch (e) {
      console.warn(`Skipping image conversion: Invalid URL format - ${url}`);
      return null;
    }

    try {
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 5000 // Add timeout to prevent hanging```````
      });

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
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: this.formatDate(data.dateOfBirth),
      verifiedAt: this.formatDate(new Date()),
      verificationType: type,
    };

    let specific = {};

    switch (type) {
      case 'NIN':
        specific = {
          idNumber: data.nin,
          middleName: data.middleName,
          gender: this.formatGender(data.gender),
          phone: data.phone,
          address: data.address,
          photo: await this.imageToBase64(data.image)
        };
        break;

      case 'BVN':
        specific = {
          idNumber: data.bvn,
          middleName: data.middleName,
          phone: data.phone,
          enrollmentBank: data.enrollmentBank,
          photo: await this.imageToBase64(data.image)
        };
        break;

      case 'PASSPORT':
        specific = {
          idNumber: data.passportNumber,
          expiryDate: this.formatDate(data.expiryDate),
          issueDate: this.formatDate(data.issueDate),
          nationality: data.nationality,
          photo: null
        };
        break;

      case 'DRIVERS_LICENSE':
        specific = {
          idNumber: data.licenseNumber,
          expiryDate: this.formatDate(data.expiryDate),
          issuedDate: this.formatDate(data.issuedDate),
          class: data.class,
          stateOfIssue: data.stateOfIssue,
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