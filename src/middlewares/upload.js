const fs = require('fs');
const multer = require('multer');
const VerificationPhone = require('../models/verfication_model');

// Configure multer to accept only JSON files
const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed!'), false);
        }
    }
}).single('file');  // Changed field name to 'file' which is more common

const transformDataToSchema = (data) => {
    if (typeof data !== 'object' || data === null) {
        throw new Error("Invalid record format: Expected an object.");
    }
    return {
        phone_number: data.phoneNumber || data.phone_number || '',
        country: data.country || '',
        carrier: data.carrier || '',
        type: data.type || '',
        region: data.region || '',
    };
};

const UploadFile = async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        filePath = req.file.path;
        let fileData;
        let jsonData;

        try {
            fileData = fs.readFileSync(filePath, 'utf8');
            jsonData = JSON.parse(fileData);
        } catch (err) {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error deleting temp file:', unlinkErr);
                }
            }

            if (err instanceof SyntaxError) {
                return res.status(400).json({ error: 'Invalid JSON format', details: err.message });
            }
            return res.status(500).json({ error: 'Error reading file', details: err.message });
        }

        if (!Array.isArray(jsonData)) {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error deleting temp file:', unlinkErr);
                }
            }
            return res.status(400).json({ error: 'Invalid data format: Expected a JSON array' });
        }

        let transformedData;
        try {
            transformedData = jsonData.map(record => transformDataToSchema(record));
        } catch (transformError) {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error deleting temp file:', unlinkErr);
                }
            }
            return res.status(400).json({ error: transformError.message });
        }

        if (!VerificationPhone) {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error deleting temp file:', unlinkErr);
                }
            }
            return res.status(500).json({ error: "Server configuration error" });
        }

        let savedDocs = [];
        try {
            savedDocs = await VerificationPhone.insertMany(transformedData, { ordered: false });
        } catch (dbError) {
            console.error('Database error:', dbError);
            let savedCount = 0;
            if (dbError.name === 'MongoBulkWriteError' && dbError.result) {
                savedCount = dbError.result.nInserted || 0;
            }
            
            return res.status(400).json({
                error: 'Database operation failed',
                savedCount: savedCount,
                details: dbError.message
            });
        }

        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error('Error deleting temp file:', unlinkErr);
            }
        }

        return res.status(201).json({
            message: `Successfully saved ${savedDocs.length} records.`,
            insertedCount: savedDocs.length
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error('Error deleting temp file:', unlinkErr);
            }
        }
        return res.status(500).json({ error: 'Unexpected server error' });
    }
};

// Export as a single function that combines multer and handler
module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            // Handle multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File too large' });
            }
            if (err.message === 'Only JSON files are allowed!') {
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }
        // If multer succeeded, proceed to our handler
        UploadFile(req, res, next);
    });
};