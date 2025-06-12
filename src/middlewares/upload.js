const fs = require('fs');
const multer = require('multer');
const VerificationPhone = require('../models/verification_model'); // Corrected path
const { BadRequestError, InternalServerError } = require('../utils/errors');

// Configure multer to accept only JSON files
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/json' ||
      file.originalname.endsWith('.json')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed!'), false);
    }
  },
}).single('file'); // Changed field name to 'file' which is more common

const transformDataToSchema = (data) => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid record format: Expected an object.');
  }
  return {
    phoneNumber:
      data['E164 number'] || data['Int. number'] || data['Local number'] || '', // Use E164, fallback to Int. or Local
    country: data.Country || '', // Source from 'Country' in input JSON
    carrier: data.Carrier || '', // Source from 'Carrier' in input JSON
    type: data.Type || '', // Source from 'Type' in input JSON
    region: data.Region || '', // Source from 'Region' in input JSON
    // Adding new fields based on file_context_0 and common needs
    valid: typeof data.Valid === 'boolean' ? data.Valid : false, // Source from 'Valid', default to false
    dialCode: data['Dial code'] || '', // Source from 'Dial code' in input JSON
  };
};

// Helper function for background processing
const processFileInBackground = async (filePath, originalname) => {
  try {
    console.log(`Starting background processing for ${originalname}...`);
    const fileData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileData);

    if (!Array.isArray(jsonData)) {
      throw new Error('Invalid data format: Expected a JSON array');
    }

    const transformedData = jsonData.map(transformDataToSchema);

    if (!VerificationPhone) {
      throw new Error('Server model configuration error (VerificationPhone not available).');
    }

    const savedDocs = await VerificationPhone.insertMany(transformedData, {
      ordered: false, // Continue inserting even if some records fail
    });
    console.log(
      `Successfully processed and saved ${savedDocs.length} records from ${originalname}.`,
    );
  } catch (processingError) {
    console.error(
      `Error processing file ${originalname} in background:`,
      processingError.message,
      processingError.stack,
    );
    // Add more sophisticated error reporting here if needed (e.g., to a monitoring service or a specific log)
  } finally {
    // Cleanup the file after processing (or attempting to process)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temporary file: ${filePath}`);
      } catch (unlinkErr) {
        console.error(`Error deleting temp file ${filePath} in background:`, unlinkErr);
      }
    }
  }
};


const UploadFile = async (req, res, next) => {
  // Note: filePath is now managed by processFileInBackground for deletion
  // We only need it here to pass to the background processor.
  let currentFilePath = null;
  try {
    if (!req.file) {
      return next(new BadRequestError('No file uploaded'));
    }
    currentFilePath = req.file.path; // Store for potential immediate cleanup if pre-processing fails

    // Perform initial validation of the file structure (e.g., is it valid JSON?)
    // This is a quick check before handing off to background processing.
    let jsonData;
    try {
      const fileData = fs.readFileSync(currentFilePath, 'utf8');
      jsonData = JSON.parse(fileData); // Just to check if it's valid JSON
    } catch (err) {
      // If file reading or JSON parsing fails, it's an immediate error.
      // Cleanup the file immediately as background processing won't happen.
      if (currentFilePath && fs.existsSync(currentFilePath)) {
        try {
          fs.unlinkSync(currentFilePath);
        } catch (unlinkErr) {
          console.error('Error deleting temp file during initial validation:', unlinkErr);
        }
      }
      if (err instanceof SyntaxError) {
        return next(new BadRequestError(`Invalid JSON format: ${err.message}`));
      }
      return next(new InternalServerError(`Error reading file: ${err.message}`));
    }

    if (!Array.isArray(jsonData)) {
        if (currentFilePath && fs.existsSync(currentFilePath)) {
          try {
            fs.unlinkSync(currentFilePath);
          } catch (unlinkErr) {
            console.error('Error deleting temp file during initial validation (not an array):', unlinkErr);
          }
        }
      return next(new BadRequestError('Invalid data format: Expected a JSON array'));
    }

    // At this point, the file seems okay for background processing.
    const jobData = { filePath: currentFilePath, originalname: req.file.originalname };

    // Respond to client
    res.status(202).json({
      message: `File ${jobData.originalname} uploaded successfully and is being processed.`,
    });

    // Defer actual processing
    setImmediate(() => {
      // Pass the responsibility of the file path to the background processor
      processFileInBackground(jobData.filePath, jobData.originalname);
    });

    // Set currentFilePath to null so the main function's finally block doesn't try to delete it
    currentFilePath = null;

  } catch (error) {
    console.error('Unexpected error in UploadFile handler:', error);
    // This catch is for errors *before* deferring or if deferring itself fails.
    // If currentFilePath is still set, it means an error occurred before responsibility was passed.
    if (currentFilePath && fs.existsSync(currentFilePath)) {
      try {
        fs.unlinkSync(currentFilePath);
      } catch (unlinkErr) {
        console.error('Error deleting temp file in UploadFile catch block:', unlinkErr);
      }
    }
    next(error); // Pass to global error handler
  }
  // The 'finally' block for deleting filePath is removed from here.
  // Cleanup is now handled by processFileInBackground or the catch blocks above if pre-processing fails.
};

// Export as a single function that combines multer and handler
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      // Handle multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('File too large'));
      }
      if (err.message === 'Only JSON files are allowed!') {
        return next(new BadRequestError(err.message));
      }
      return next(new BadRequestError(err.message || 'File upload failed'));
    }
    // If multer succeeded, proceed to our handler
    // UploadFile is already designed to call next(error) if something goes wrong within it.
    UploadFile(req, res, next);
  });
};
