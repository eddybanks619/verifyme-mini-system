const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const ninController = require('./modules/nin/nin.controller');
const bvnController = require('./modules/bvn/bvn.controller');
const passportController = require('./modules/passport/passport.controller');
const dlController = require('./modules/drivers-license/dl.controller');
const auditController = require('./modules/audit/audit.controller');

const authenticate = require('./middlewares/authenticate.middleware');
const authorize = require('./middlewares/authorize.middleware');
const rateLimiter = require('./middlewares/rateLimit.middleware');
const validatePrivacy = require('./middlewares/validatePrivacy.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Gov Provider' });
});

// Apply Authentication to all API routes
app.use('/api', authenticate);

// Apply Rate Limiting
app.use('/api', rateLimiter);

// Audit Logs Endpoint (Authenticated but not Authorized by service type)
app.get('/api/v1/audit/logs', auditController.getOrganizationLogs);

// Routes with Authorization and Privacy Validation
app.post('/api/v1/nin/verify', validatePrivacy, authorize('NIN'), ninController.verifyNIN);
app.post('/api/v1/bvn/verify', validatePrivacy, authorize('BVN'), bvnController.verifyBVN);
app.post('/api/v1/passport/verify', validatePrivacy, authorize('PASSPORT'), passportController.verifyPassport);
app.post('/api/v1/drivers-license/verify', validatePrivacy, authorize('DRIVERS_LICENSE'), dlController.verifyDL);

module.exports = app;