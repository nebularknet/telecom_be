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
const initiateGoogleAuth = require ('../controllers/auth/google_auth/auth_request');
const handleGoogleOAuthCallback = require ('../controllers/auth/google_auth/google_oauth');
const { authenticateToken } = require('../middlewares/Auth'); // Import authenticateToken middleware
const authrouter = express.Router();

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
 *       400:
 *         description: Bad request
 */
authrouter.post('/auth/signup', signupController);

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
 *       401:
 *         description: Unauthorized
 */
authrouter.post('/auth/login', loginController);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
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
 *         description: Password reset email sent
 *       400:
 *         description: Bad request
 */
authrouter.post('/auth/password-reset/request', requestPasswordResetController);

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
 *         description: Bad request
 */
authrouter.post('/auth/password-reset/confirm', confirmPasswordResetController);

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
 */
authrouter.post('/auth/reset-password', resetPasswordController);

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
 *         description: Bad request
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
authrouter.post('/auth/google/request',initiateGoogleAuth)

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
authrouter.get('/auth/oauth',handleGoogleOAuthCallback) // Changed from post to get

module.exports=authrouter
