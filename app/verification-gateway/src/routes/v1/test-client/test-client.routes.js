const express = require('express');
const router = express.Router();
const testClientController = require('../../../modules/test-client/test-client.controller');

// This route is intentionally unauthenticated for testing purposes
router.post('/verify', testClientController.testVerify);

module.exports = router;