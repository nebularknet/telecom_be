const express = require('express');
const UploadFile = require('../middlewares/upload'); // This is the combined multer and handler middleware
const { fileUploadLimiter } = require('../middlewares/rateLimit'); // Import file upload limiter

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a JSON file for batch phone number validation processing.
 *     description: Accepts a JSON file containing an array of phone number records to be validated and stored. The processing is done asynchronously.
 *     tags: [Upload, Batch]
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: File accepted for processing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "File uploaded_filename.json uploaded successfully and is being processed." }
 *       400:
 *         description: Bad request (e.g., no file, invalid file type, invalid JSON structure)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (e.g., user does not have permission to upload files - if specific permission is added)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests (rate limit exceeded)
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
// POST /api/upload
// The UploadFile middleware from src/middlewares/upload.js is designed to handle the request fully
// including sending responses or calling next(error). So, no additional handler is needed here.
router.post('/', authenticateToken, fileUploadLimiter, UploadFile); // Added authenticateToken

module.exports = router;
