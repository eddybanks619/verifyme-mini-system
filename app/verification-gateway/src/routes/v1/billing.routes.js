const express = require('express');
const router = express.Router();
const billingController = require('../../modules/billing/controller/billing.controller');
const rateLimit = require('../../middlewares/rateLimit.middleware');


router.post('/wallet/fund', rateLimit('billing-fund', 100), billingController.fundWallet);
router.get('/wallet/balance', rateLimit('billing-balance', 100), billingController.getBalance);
router.get('/wallet/transactions', rateLimit('billing-history', 100), billingController.getHistory);

module.exports = router;