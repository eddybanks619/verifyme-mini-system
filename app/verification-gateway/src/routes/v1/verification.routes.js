const express = require('express');
const router = express.Router();
const verificationController = require('../../modules/verification/controller/verification.controller');
const validate = require('../../middlewares/validate.middleware');
const rateLimit = require('../../middlewares/rateLimit.middleware');
const { verifySchema } = require('../../modules/verification/data/schema/verification.schema');


router.post('/verify', rateLimit('verify', 100), validate(verifySchema), verificationController.queueVerification);

router.get('/verification/:id', rateLimit('get-status', 200), verificationController.getVerificationStatus);

module.exports = router;