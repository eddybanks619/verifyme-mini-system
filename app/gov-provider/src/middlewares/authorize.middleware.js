const authorize = (service, requiredScope = 'VERIFY_ONLY') => {
  return (req, res, next) => {
    const { organization } = req;

    if (!organization) {
      return res.status(401).json({
        code: 'AUTH401',
        message: 'UNAUTHENTICATED'
      });
    }

    const servicePermissions = organization.permissions[service];

    if (!servicePermissions || servicePermissions.length === 0) {
      return res.status(403).json({
        code: 'AUTH403',
        message: `SERVICE NOT PERMITTED: ${service}`
      });
    }

    // Check if the organization has the required scope
    // If requiredScope is 'VERIFY_ONLY', and they have 'BIODATA', they should also be allowed (hierarchy)
    // But for simplicity, let's check for exact match or if 'BIODATA' implies 'VERIFY_ONLY' access?
    // Usually BIODATA > VERIFY_ONLY.
    
    const hasPermission = servicePermissions.includes(requiredScope) || 
                          (requiredScope === 'VERIFY_ONLY' && servicePermissions.includes('BIODATA'));

    if (!hasPermission) {
      return res.status(403).json({
        code: 'AUTH403',
        message: `INSUFFICIENT PERMISSIONS FOR ${service}`
      });
    }

    next();
  };
};

module.exports = authorize;