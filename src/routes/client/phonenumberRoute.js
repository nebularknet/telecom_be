const express = require('express');
const PhoneNumberSearch = require('../../controllers/client/veriPhoneNumberSearch');
const { authenticateToken, checkPermission } = require('../../middlewares/Auth'); // Import Auth middlewares
const authrouter = express.Router();

/**
 * @swagger
 * /client/verify:
 *   post:
 *     summary: Verify a phone number
 *     tags: [Client]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (e.g., token missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (e.g., user does not have 'phonenumber:validate' permission)
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authrouter.post(
  '/verify',
  authenticateToken, // Ensure user is logged in
  checkPermission('phonenumber:validate'), // Check if user has permission
  PhoneNumberSearch,
);

module.exports = authrouter;
