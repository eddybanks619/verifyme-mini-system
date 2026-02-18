const express = require('express');
const router = express.Router();
const testBillingController = require('../../../modules/test-client/test-billing.controller');
const rateLimit = require('../../../middlewares/rateLimit.middleware');

// Unauthenticated routes for testing billing functionality
// Apply rate limiting: 100 requests per minute per endpoint
router.post('/fund', rateLimit('test-billing-fund', 100), testBillingController.testFundWallet);
router.get('/balance', rateLimit('test-billing-balance', 100), testBillingController.testGetBalance);
router.get('/transactions', rateLimit('test-billing-history', 100), testBillingController.testGetHistory);

module.exports = router;