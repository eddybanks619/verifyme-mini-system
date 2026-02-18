const express = require('express');
const router = express.Router();
const auditController = require('../../modules/audit/controller/audit.controller');
const rateLimit = require('../../middlewares/rateLimit.middleware');


router.get('/history',rateLimit('audit-history', 100),auditController.getVerificationHistory);

module.exports = router;