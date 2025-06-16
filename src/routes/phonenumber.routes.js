const express = require('express');
const PhoneNumberSearch = require('../controllers/client/veriphonenumbersearch.controller');
const {UnAuthUser} = require('../middleware/unAuthUser.middleware');
const {checkRole,checkReadPermission} = require('../middleware/auth.middleware');
const {READ_PERMISSIONS} = require('../models/role.model')
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
phoneNumberRouter.post('/verify', UnAuthUser, checkRole('ANONYMOUS'), checkReadPermission(READ_PERMISSIONS.PUBLIC), PhoneNumberSearch)

module.exports = phoneNumberRouter