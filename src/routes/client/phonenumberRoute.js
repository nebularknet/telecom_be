const express = require('express');
const PhoneNumberSearch = require('../../controllers/client/veriPhoneNumberSearch');
const {UnAuthUser} = require('../../middlewares/unAuthUser');
const authrouter = express.Router();



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
authrouter.post('/verify',UnAuthUser,PhoneNumberSearch)

module.exports=authrouter
