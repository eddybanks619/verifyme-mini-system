const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const ninController = require('./modules/nin/nin.controller');
const bvnController = require('./modules/bvn/bvn.controller');
const passportController = require('./modules/passport/passport.controller');
const dlController = require('./modules/drivers-license/dl.controller');

const authenticate = require('./middlewares/authenticate.middleware');
const authorize = require('./middlewares/authorize.middleware');
const rateLimiter = require('./middlewares/rateLimit.middleware');

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

// Routes with Authorization
app.get('/api/v1/nin/:id', authorize('NIN', 'VERIFY_ONLY'), ninController.verifyNIN);
app.get('/api/v1/bvn/:id', authorize('BVN', 'VERIFY_ONLY'), bvnController.verifyBVN);
app.get('/api/v1/passport/:id', authorize('PASSPORT', 'VERIFY_ONLY'), passportController.verifyPassport);
app.get('/api/v1/drivers-license/:id', authorize('DRIVERS_LICENSE', 'VERIFY_ONLY'), dlController.verifyDL);

module.exports = app;