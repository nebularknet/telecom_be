const rateLimit = require('express-rate-limit');
const { TooManyRequestsError } = require('../utils/errors');
const env = require('../config/env');

// Handler for when rate limit is exceeded
const rateLimitHandler = (req, res, next, options) => {
  // Log the rate limit hit for monitoring purposes if desired
  // console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
  next(
    new TooManyRequestsError(
      `Too many requests, please try again after ${Math.ceil(
        options.windowMs / 60000,
      )} minutes.`,
    ),
  );
};

// Generic limiter for most API calls
const genericApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_GENERIC_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_GENERIC_MAX || 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  message: 'This message is not used as a custom handler is provided, but good to have as fallback.',
});

// Stricter limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS || 1 * 60 * 1000, // 1 minute
  max: env.RATE_LIMIT_LOGIN_MAX || 5, // Limit each IP to 5 login requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many login attempts. Please try again later.',
});

// Limiter for signup attempts
const signupLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_SIGNUP_WINDOW_MS || 60 * 60 * 1000, // 1 hour
  max: env.RATE_LIMIT_SIGNUP_MAX || 5, // Limit each IP to 5 signup attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many accounts created from this IP, please try again after an hour.',
});

// Limiter for password reset requests
const passwordResetLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MS || 60 * 60 * 1000, // 1 hour
  max: env.RATE_LIMIT_PASSWORD_RESET_MAX || 3, // Limit each IP to 3 password reset requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many password reset attempts, please try again after an hour.',
});

// Limiter for file uploads
const fileUploadLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_FILE_UPLOAD_WINDOW_MS || 60 * 60 * 1000, // 1 hour
  max: env.RATE_LIMIT_FILE_UPLOAD_MAX || 10, // Limit each IP to 10 file uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many file upload attempts, please try again after an hour.',
});

module.exports = {
  genericApiLimiter,
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
  fileUploadLimiter,
};
