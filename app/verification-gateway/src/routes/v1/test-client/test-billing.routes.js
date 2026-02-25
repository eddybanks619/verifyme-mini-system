const express = require('express');
const router = express.Router();
const testBillingController = require('../../../modules/test-client/test-billing.controller');
const rateLimit = require('../../../middlewares/rateLimit.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {verifySchema} = require("../../../modules/verification/data/schema/verification.schema");


router.post('/fund', rateLimit('test-billing-fund', 100), validate(verifySchema) ,testBillingController.testFundWallet);
router.get('/balance', rateLimit('test-billing-balance', 100),validate(verifySchema) ,testBillingController.testGetBalance);
router.get('/transactions', rateLimit('test-billing-history', 100), validate(verifySchema) ,testBillingController.testGetHistory);

module.exports = router;