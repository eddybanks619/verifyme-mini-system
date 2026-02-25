const express = require('express');
const router = express.Router();

const verificationRoutes = require('./v1/verification.routes');
const auditRoutes = require('./v1/audit.routes');
const billingRoutes = require('./v1/billing.routes');
const testClientRoutes = require('./v1/test-client/test-client.routes');
const testBillingRoutes = require('./v1/test-client/test-billing.routes');
const webhookRoutes = require('./v1/webhook.routes');

const authenticateClient = require('../middlewares/authenticate.middleware');
const rateLimiter = require('../middlewares/rateLimit.middleware');


router.use('/v1/test-client', testClientRoutes);
router.use('/v1/test-billing', testBillingRoutes);

// Webhook Routes (Authenticated via signature, not client ID)
router.use('/v1/webhook', webhookRoutes);

// Apply client authentication to all other API routes
router.use(authenticateClient);
// router.use(rateLimiter); // Rate limiter is applied per route now

router.use('/v1', verificationRoutes);
router.use('/v1', auditRoutes);
router.use('/v1/billing', billingRoutes);

module.exports = router;