const authorize = (service) => {
  return (req, res, next) => {
    const { organization } = req;
    const { mode } = req.body;

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

    if (!servicePermissions.includes(mode)) {
      return res.status(403).json({
        code: 'AUTH403',
        message: `MODE NOT PERMITTED: ${mode}`
      });
    }

    next();
  };
};

module.exports = authorize;