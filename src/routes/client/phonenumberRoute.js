const express = require('express')
const PhoneNumberSearch = require('../../controllers/client/veriPhoneNumberSearch')
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
 *         description: Bad request
 */
authrouter.post('/verify',PhoneNumberSearch)

module.exports=authrouter
