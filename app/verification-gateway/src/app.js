const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const verificationController = require('./modules/verification/verification.controller');
const validate = require('./middlewares/validate.middleware');
const { verifySchema } = require('./modules/verification/verification.schema');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Verification Gateway' });
});

app.post('/api/v1/verify', validate(verifySchema), verificationController.verifyIdentity);

module.exports = app;