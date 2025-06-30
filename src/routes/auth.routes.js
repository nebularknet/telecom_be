const express = require('express');
const signupController = require('../controllers/auth/signup.controller');
const loginController = require('../controllers/auth/login.controller');
const refreshTokenController = require('../controllers/auth/refreshToken.controller');
const logoutController = require('../controllers/auth/logout.controller');
const getMeController = require('../controllers/auth/getMe.controller');
const requestPasswordResetController = require('../controllers/auth/requestPasswordReset.controller');
const confirmPasswordResetController = require('../controllers/auth/confirmPasswordReset.controller');
const resetPasswordController = require('../controllers/auth/resetPassword.controller');
const verifyEmailController = require('../controllers/auth/verifyEmail.controller');
const handleAuthRequest = require('../controllers/auth/google_auth/auth_request.controller');
const handleGoogleOAuthCallback = require('../controllers/auth/google_auth/google_oauth.controller');
const {getCurrentUserRole} = require('../controllers/auth/currentUserRole.controller')
const upgradeUserRoleController = require('../controllers/auth/upgradeUserRole.controller');
const { auth } = require('../middleware/auth.middleware'); // Import authenticateToken middleware
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
authrouter.post('/signup', signupController);

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
authrouter.post('/login', loginController);

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
authrouter.post('/refresh', refreshTokenController);

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
authrouter.post('/logout', logoutController);

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
authrouter.get('/me', auth, getMeController); // Apply authenticateToken middleware

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
authrouter.post('/password-reset/request', requestPasswordResetController);

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
authrouter.post('/password-reset/confirm', confirmPasswordResetController);

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
authrouter.post('/reset-password', resetPasswordController);

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
authrouter.get('/email-verify', verifyEmailController);

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
authrouter.post('/google/request', handleAuthRequest),

/**
 * @swagger
 * /api/auth/google/callback:
 *   post:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Google OAuth successful
 *       400:
 *         description: Bad request
 */
authrouter.post('/google/callback', handleGoogleOAuthCallback),

/**
 * @swagger
 * /api/auth/user-role:
 *   get:
 *     summary: Get current user's role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role and permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                   example: PAID_USER
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "read:own", "write:own", "read:premium" ]
 *                 description:
 *                   type: string
 *                   example: Subscribed to a plan with higher limits
 *       401:
 *         description: Unauthorized
 */

authrouter.get('/user-role', auth, getCurrentUserRole);

/**
 * @swagger
 * /api/roles/user-role/upgrade:
 *   post:
 *     summary: Upgrade current user's role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newRole
 *             properties:
 *               newRole:
 *                 type: string
 *                 enum: [TRIAL_USER, PAID_USER, ENTERPRISE_USER]
 *                 example: TRIAL_USER
 *                 description: Role to upgrade to
 *     responses:
 *       200:
 *         description: Role upgraded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upgraded to TRIAL_USER successfully.
 *                 trialStart:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-06-21T12:00:00.000Z
 *                 trialEnd:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-06-28T12:00:00.000Z
 *                 trialDaysLeft:
 *                   type: integer
 *                   example: 7
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Trial already used or forbidden role upgrade
 *       500:
 *         description: Server error
 */

authrouter.post('/user-role/upgrade', auth, upgradeUserRoleController);

module.exports = authrouter