const express = require('express');
const PhoneNumberSearch = require('../controllers/client/veriphonenumbersearch.controller');
const {dynamicRateLimiter} = require('../middleware/rateLimit.middleware');
const {auth_ANONYMOUS,auth} = require('../middleware/auth.middleware');

const phoneNumberRouter = express.Router();

/**
 * @swagger
 * /api/phonenumber/verify:
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
 *         description: Bad request
 */
// authrouter.post('/verify',checkRole('anonymous'),PhoneNumberSearch)
phoneNumberRouter.post('/verify', 
    auth_ANONYMOUS,
    dynamicRateLimiter,
    PhoneNumberSearch
);


module.exports = phoneNumberRouter