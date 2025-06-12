const express = require('express');
const signupController = require('../controllers/auth/signupController');
const loginController = require('../controllers/auth/loginController');
const refreshTokenController = require('../controllers/auth/refreshTokenController');
const logoutController = require('../controllers/auth/logoutController');
const getMeController = require('../controllers/auth/getMeController');
const requestPasswordResetController = require('../controllers/auth/requestPasswordResetController');
const confirmPasswordResetController = require('../controllers/auth/confirmPasswordResetController');
const resetPasswordController = require('../controllers/auth/resetPasswordController');
const verifyEmailController = require('../controllers/auth/verifyEmailController');
const initiateGoogleAuth = require('../controllers/auth/google_auth/auth_request');
const handleGoogleOAuthCallback = require('../controllers/auth/google_auth/google_oauth');
const { authenticateToken } = require('../middlewares/Auth'); // Import authenticateToken middleware
const { body, validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/errors');
const {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
} = require('../middlewares/rateLimit'); // Import specific rate limiters
const authrouter = express.Router();

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new BadRequestError(errorMessages.join(', ')));
  }
  next();
};

// Validation rules for signup
const signupValidationRules = [
  body('fullname', 'Full name is required').notEmpty().trim().escape(),
  body('email', 'Invalid email address').isEmail().normalizeEmail(),
  body(
    'password',
    'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
  ).isLength({ min: 8 }), // Validator only checks length; complexity is in service.
  body('role', 'Invalid role').optional().isIn(['client', 'admin']),
];

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User registered successfully." }
 *                 userId: { type: string, example: "someUserId" }
 *       400:
 *         description: Bad request (e.g., validation error, email exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.post(
  '/auth/signup',
  signupLimiter,
  signupValidationRules,
  validate,
  signupController,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "client login successful." }
 *                 accessToken: { type: string, example: "jwtAccessToken" }
 *                 user: { $ref: '#/components/schemas/UserResponse' } # Assuming UserResponse schema is defined
 *       401:
 *         description: Unauthorized (Invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Define UserResponse schema in swagger.js or here if not already global
// For now, assuming UserResponse is defined globally or this part needs adjustment
// components:
//  schemas:
//    UserResponse:
//      type: object
//      properties:
//        _id: { type: string }
//        fullname: { type: string }
//        email: { type: string }
//        role: { type: string }
//        isEmailVerified: { type: boolean }
//        tenantId: { type: string, nullable: true }

// Validation rules for login
const loginValidationRules = [
  body('email', 'Invalid email address').isEmail().normalizeEmail(),
  body('password', 'Password is required').notEmpty(),
  body('role', 'Role is required').notEmpty().isIn(['client', 'admin']),
];

authrouter.post(
  '/auth/login',
  loginLimiter,
  loginValidationRules,
  validate,
  loginController,
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string, example: "newJwtAccessToken" }
 *       401:
 *         description: Unauthorized (e.g., no refresh token, invalid refresh token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (e.g., refresh token mismatch or other permission issue)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.post('/auth/refresh', refreshTokenController);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
authrouter.post('/auth/logout', logoutController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: [] # Indicates this endpoint uses bearer token authentication
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/UserResponse' } # Assuming UserResponse
 *       401:
 *         description: Unauthorized (e.g., token missing, invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.get('/auth/me', authenticateToken, getMeController); // Apply authenticateToken middleware

/**
 * @swagger
 * /api/auth/password-reset/request:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent (or generic success to prevent email enumeration)
 *       400:
 *         description: Bad request (e.g., email not provided)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.post(
  '/auth/password-reset/request',
  passwordResetLimiter,
  requestPasswordResetController,
);

/**
 * @swagger
 * /api/auth/password-reset/confirm:
 *   post:
 *     summary: Confirm password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request (e.g., invalid or expired token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.post(
  '/auth/password-reset/confirm',
  passwordResetLimiter, // Apply same limiter as request, or a different one
  confirmPasswordResetController,
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.post(
  '/auth/reset-password',
  passwordResetLimiter, // Apply same limiter
  resetPasswordController,
);

/**
 * @swagger
 * /api/auth/email-verify:
 *   get:
 *     summary: Verify email address
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Bad request (e.g., invalid or expired token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.get('/auth/email-verify', verifyEmailController);

/**
 * @swagger
 * /api/auth/google/request:
 *   post:
 *     summary: Initiate Google authentication request
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Google auth request initiated
 */
authrouter.post('/auth/google/request', initiateGoogleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Google OAuth successful
 *       400:
 *         description: Bad request
 */
authrouter.get('/auth/oauth', handleGoogleOAuthCallback); // Changed from post to get

module.exports = authrouter;
