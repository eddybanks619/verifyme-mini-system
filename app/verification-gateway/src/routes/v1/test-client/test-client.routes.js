const express = require('express');
const router = express.Router();
const testClientController = require('../../../modules/test-client/test-client.controller');
const rateLimit = require('../../../middlewares/rateLimit.middleware');

// This route is intentionally unauthenticated for testing purposes
// Apply rate limiting: 100 requests per minute
router.post('/verify', rateLimit('test-client-verify', 100), testClientController.testVerify);

module.exports = router;