const express = require('express');
const UploadFile = require('../middleware/upload.middleware.'); // Assuming UploadFile is the multer middleware setup

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
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
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 */
// POST /api/upload
router.post('/', UploadFile, (req, res) => {
  // Assuming UploadFile middleware handles the file and adds info to req.file or req.files
  if (!req.file && !req.files) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  // You might want to send back information about the uploaded file
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully.',
    file: req.file || req.files
  });
});

module.exports = router;
