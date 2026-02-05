const express = require('express');
const router = express.Router();
const auditController = require('../../modules/audit/audit.controller');

router.get('/history', auditController.getVerificationHistory);

module.exports = router;