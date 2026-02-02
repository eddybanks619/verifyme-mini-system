const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const ninController = require('./modules/nin/nin.controller');
const bvnController = require('./modules/bvn/bvn.controller');
const passportController = require('./modules/passport/passport.controller');
const dlController = require('./modules/drivers-license/dl.controller');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Simple API Key Middleware
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  next();
};

app.use('/api', checkApiKey);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Gov Provider' });
});

app.get('/api/v1/nin/:id', ninController.verifyNIN);
app.get('/api/v1/bvn/:id', bvnController.verifyBVN);
app.get('/api/v1/passport/:id', passportController.verifyPassport);
app.get('/api/v1/drivers-license/:id', dlController.verifyDL);

module.exports = app;