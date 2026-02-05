const express = require('express');
const router = express.Router();

const identityRoutes = require('./v1/identity.routes');
const auditRoutes = require('./v1/audit.routes');

const authenticate = require('../middlewares/authenticate.middleware');
const rateLimiter = require('../middlewares/rateLimit.middleware');

// Apply Global Middleware
router.use(authenticate);
router.use(rateLimiter);

// Mount Routes
router.use('/v1', identityRoutes);
router.use('/v1/audit', auditRoutes);

module.exports = router;