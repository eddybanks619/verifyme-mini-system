const rateLimit = require('express-rate-limit');

// We will use a dynamic rate limiter based on the organization's limit
// Since express-rate-limit is global or per-route, we need a custom wrapper or store.
// For simplicity in this simulation, we'll use a basic in-memory map or just a standard limiter
// but keyed by clientId.

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req) => {
    return req.organization ? req.organization.rateLimit : 10;
  },
  keyGenerator: (req) => {
    return req.organization ? req.organization.clientId : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: 'RATE429',
      message: 'TOO MANY REQUESTS'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;