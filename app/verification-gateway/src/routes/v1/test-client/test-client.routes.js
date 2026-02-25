const express = require('express');
const router = express.Router();
const testClientController = require('../../../modules/test-client/test-client.controller');
const rateLimit = require('../../../middlewares/rateLimit.middleware');
const validate = require("../../../middlewares/validate.middleware");
const {verifySchema} = require("../../../modules/verification/data/schema/verification.schema");


router.post('/verify', rateLimit('test-client-verify', 100), validate(verifySchema),testClientController.testVerify);

module.exports = router;