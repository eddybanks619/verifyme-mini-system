const express = require('express');
const router = express.Router();

const verificationRoutes = require('./v1/verification.routes');
const auditRoutes = require('./v1/audit.routes');
const billingRoutes = require('./v1/billing.routes');

const authenticateClient = require('../middlewares/authenticate.middleware');

// Apply client authentication to all API routes
// router.use(authenticateClient); // Temporarily commented out for testing

router.use('/v1', verificationRoutes);
router.use('/v1', auditRoutes);
router.use('/v1/billing', billingRoutes);

module.exports = router;