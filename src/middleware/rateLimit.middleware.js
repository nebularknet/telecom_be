const rateLimit = require('express-rate-limit');

const dynamicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes default
  max: (req, res) => {
    switch (req.userRoleName) {
      case 'ANONYMOUS':
        return 10; // very limited
      case 'FREE_USER':
        return 50;
      case 'TRIAL_USER':
        return 100;
      case 'PAID_USER':
        return 200;
      case 'ENTERPRISE_USER':
        return 500;
      default:
        return 10;
    }
  },
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later.'
    });
  }
});

module.exports = { dynamicRateLimiter };
