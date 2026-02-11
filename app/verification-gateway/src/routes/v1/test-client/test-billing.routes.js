const express = require('express');
const router = express.Router();
const testBillingController = require('../../../modules/test-client/test-billing.controller');

// Unauthenticated routes for testing billing functionality
router.post('/fund', testBillingController.testFundWallet);
router.get('/balance', testBillingController.testGetBalance);
router.get('/transactions', testBillingController.testGetHistory);

module.exports = router;