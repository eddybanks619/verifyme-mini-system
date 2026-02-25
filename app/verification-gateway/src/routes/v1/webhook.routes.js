const express = require('express');
const router = express.Router();
const webhookController = require('../../modules/verification/controller/webhook.controller');

router.post('/gov-provider', webhookController.handleGovProviderWebhook);

module.exports = router;