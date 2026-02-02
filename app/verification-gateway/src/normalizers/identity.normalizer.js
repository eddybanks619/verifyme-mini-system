class IdentityNormalizer {
  normalize(type, data) {
    const common = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      raw: data,
      verifiedAt: new Date(),
      verificationType: type
    };

    switch (type) {
      case 'NIN':
        return {
          ...common,
          idNumber: data.nin,
          middleName: data.middleName,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          photo: data.photoUrl
        };
      case 'BVN':
        return {
          ...common,
          idNumber: data.bvn,
          middleName: data.middleName,
          phone: data.phone,
          enrollmentBank: data.enrollmentBank
        };
      case 'PASSPORT':
        return {
          ...common,
          idNumber: data.passportNumber,
          expiryDate: data.expiryDate,
          issueDate: data.issueDate,
          nationality: data.nationality
        };
      case 'DRIVERS_LICENSE':
        return {
          ...common,
          idNumber: data.licenseNumber,
          expiryDate: data.expiryDate,
          issuedDate: data.issuedDate,
          class: data.class,
          stateOfIssue: data.stateOfIssue
        };
      default:
        return common;
    }
  }
}

module.exports = new IdentityNormalizer();