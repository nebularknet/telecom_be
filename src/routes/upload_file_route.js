const express = require('express');
const UploadFile = require('../middlewares/upload'); // Assuming UploadFile is the multer middleware setup

const router = express.Router();

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
