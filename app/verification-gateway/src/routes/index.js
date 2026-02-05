const express = require('express');
const router = express.Router();

const verificationRoutes = require('./v1/verification.routes');
const auditRoutes = require('./v1/audit.routes');

router.use('/v1', verificationRoutes);
router.use('/v1', auditRoutes);

module.exports = router;