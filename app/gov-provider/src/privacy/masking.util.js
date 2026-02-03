const maskData = (data, mode) => {
  if (!data) return null;

  // Convert mongoose document to object if needed
  const record = data.toObject ? data.toObject() : data;
  
  // Remove internal fields
  delete record._id;
  delete record.__v;
  delete record.createdAt;

  if (mode === 'existence_check') {
    return { exists: true };
  }

  if (mode === 'basic_identity') {
    return {
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth
    };
  }

  if (mode === 'full_profile') {
    return record;
  }

  return null;
};

module.exports = { maskData };