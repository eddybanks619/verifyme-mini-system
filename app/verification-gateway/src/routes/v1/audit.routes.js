const express = require('express');
const router = express.Router();
const auditController = require('../../modules/audit/controller/audit.controller');

router.get('/history', auditController.getVerificationHistory);

module.exports = router;