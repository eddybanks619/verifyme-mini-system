const express = require('express');
const router = express.Router();
const auditController = require('../../modules/audit/controller/audit.controller');

router.get('/logs', auditController.getOrganizationLogs);

module.exports = router;