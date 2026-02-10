const express = require('express');
const router = express.Router();
const verificationController = require('../../modules/verification/controller/verification.controller');
const validate = require('../../middlewares/validate.middleware');
const { verifySchema } = require('../../modules/verification/data/schema/verification.schema');

// router.post('/verify', validate(verifySchema), verificationController.verifyIdentity); // Temporarily commented out for testing
router.post('/verify', verificationController.verifyIdentity); // Temporarily commented out for testing

module.exports = router;