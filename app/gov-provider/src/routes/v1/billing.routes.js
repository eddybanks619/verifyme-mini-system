const express = require('express');
const router = express.Router();
const billingController = require('../../modules/billing/billing.controller');

router.post('/wallet/fund', billingController.fundWallet);
router.get('/wallet/balance', billingController.getBalance);
router.get('/wallet/transactions', billingController.getHistory);

module.exports = router;