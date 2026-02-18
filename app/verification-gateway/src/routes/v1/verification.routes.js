const express = require('express');
const router = express.Router();
const verificationController = require('../../modules/verification/controller/verification.controller');
const validate = require('../../middlewares/validate.middleware');
const rateLimit = require('../../middlewares/rateLimit.middleware');
const { verifySchema } = require('../../modules/verification/data/schema/verification.schema');

// Apply rate limiting: 100 requests per minute per client for this endpoint
router.post('/verify', rateLimit('verify', 100), validate(verifySchema), verificationController.verifyIdentity);

module.exports = router;