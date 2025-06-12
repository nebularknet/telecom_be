require('dotenv').config(); // Ensures .env variables are loaded

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET, // Added for refresh token
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Example for email (if you were using nodemailer)
  // EMAIL_HOST: process.env.EMAIL_HOST,
  // EMAIL_PORT: process.env.EMAIL_PORT,
  // EMAIL_USER: process.env.EMAIL_USER,
  // EMAIL_PASS: process.env.EMAIL_PASS,
  GOOGLE_CLIENTID: process.env.GOOGLE_CLIENTID,
  GOOGLE_SECRETID: process.env.GOOGLE_SECRETID,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  FROM_NAME: process.env.FROM_NAME,
  FROM_EMAIL: process.env.FROM_EMAIL,

  // Rate Limiting Configuration (added parseInt for numeric values)
  RATE_LIMIT_GENERIC_WINDOW_MS: parseInt(process.env.RATE_LIMIT_GENERIC_WINDOW_MS, 10) || (15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_GENERIC_MAX: parseInt(process.env.RATE_LIMIT_GENERIC_MAX, 10) || 100,
  RATE_LIMIT_LOGIN_WINDOW_MS: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 10) || (1 * 60 * 1000),    // 1 minute
  RATE_LIMIT_LOGIN_MAX: parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 5,
  RATE_LIMIT_SIGNUP_WINDOW_MS: parseInt(process.env.RATE_LIMIT_SIGNUP_WINDOW_MS, 10) || (60 * 60 * 1000), // 1 hour
  RATE_LIMIT_SIGNUP_MAX: parseInt(process.env.RATE_LIMIT_SIGNUP_MAX, 10) || 5,
  RATE_LIMIT_PASSWORD_RESET_WINDOW_MS: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MS, 10) || (60 * 60 * 1000), // 1 hour
  RATE_LIMIT_PASSWORD_RESET_MAX: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_MAX, 10) || 3,
  RATE_LIMIT_FILE_UPLOAD_WINDOW_MS: parseInt(process.env.RATE_LIMIT_FILE_UPLOAD_WINDOW_MS, 10) || (60 * 60 * 1000), // 1 hour
  RATE_LIMIT_FILE_UPLOAD_MAX: parseInt(process.env.RATE_LIMIT_FILE_UPLOAD_MAX, 10) || 10,

  // JWT & Cookie Secrets
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET, // For signing cookies (optional but recommended if not just HttpOnly)
};

// Validate critical environment variables
if (!env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
}
if (!env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
if (!env.REFRESH_TOKEN_SECRET) {
  console.error('FATAL ERROR: REFRESH_TOKEN_SECRET is not defined.'); // Made this critical
  process.exit(1);
}
if (!env.COOKIE_SECRET) {
  // If you plan to use signed cookies, this becomes critical.
  // For HttpOnly refresh tokens, it's less critical but good for general cookie security.
  console.warn('WARNING: COOKIE_SECRET is not defined. Cookie security might be reduced.');
}
// Add more critical checks as needed, e.g., for Google OAuth client IDs if they are essential for startup
if (!env.GOOGLE_CLIENTID) {
  console.warn('WARNING: GOOGLE_CLIENTID is not defined. Google OAuth may not work.');
}
if (!env.GOOGLE_SECRETID) {
  console.warn('WARNING: GOOGLE_SECRETID is not defined. Google OAuth may not work.');
}
if (!env.GOOGLE_REDIRECT_URI) {
  console.warn('WARNING: GOOGLE_REDIRECT_URI is not defined. Google OAuth may not work.');
}

// Optional: Add warnings for SMTP variables if email is a core feature
if (!env.SMTP_HOST) {
  console.warn('WARNING: SMTP_HOST is not defined. Email sending may not work.');
}
if (!env.FROM_EMAIL) {
  console.warn('WARNING: FROM_EMAIL is not defined. Email sending may not work.');
}

module.exports = env;
