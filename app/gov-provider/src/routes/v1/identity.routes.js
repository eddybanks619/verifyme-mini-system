const express = require('express');
const router = express.Router();

const ninController = require('../../modules/nin/controller/nin.controller');
const bvnController = require('../../modules/bvn/controller/bvn.controller');
const passportController = require('../../modules/passport/controller/passport.controller');
const dlController = require('../../modules/drivers-license/controller/dl.controller');

const authorize = require('../../middlewares/authorize.middleware');
const validatePrivacy = require('../../middlewares/validatePrivacy.middleware');
const rateLimit = require('../../middlewares/rateLimit.middleware');

// Apply privacy validation to all identity routes
router.use(validatePrivacy);

router.post('/nin/verify', rateLimit('nin', 100), ninController.verifyNIN);
router.post('/bvn/verify', rateLimit('bvn', 100), authorize('BVN'), bvnController.verifyBVN);
router.post('/passport/verify', rateLimit('passport', 100), authorize('PASSPORT'), passportController.verifyPassport);
router.post('/drivers-license/verify', rateLimit('drivers-license', 100), authorize('DRIVERS_LICENSE'), dlController.verifyDL);

module.exports = router;