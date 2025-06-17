const express = require('express');
const PhoneNumberSearch = require('../controllers/client/veriphonenumbersearch.controller');
const {UnAuthUser} = require('../middleware/unAuthUser.middleware');
const {checkRole} = require('../middleware/auth.middleware');
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
    UnAuthUser, 
    checkRole('ANONYMOUS','read:public'),
    PhoneNumberSearch
);

module.exports = phoneNumberRouter