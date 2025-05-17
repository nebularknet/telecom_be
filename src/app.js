const express = require("express");
const morgan = require('morgan'); // Import morgan
const cors = require("cors");
const userRouter = require("./routes/user_route"); // Renamed from UserRouting
const phoneNumberRouter = require('./routes/client/phonenumberRoute'); // Renamed from veriphonenumber
const uploadRouter = require('./routes/upload_file_route'); // Import the new upload router

const app = express();

// Use morgan for request logging
// 'dev' format gives concise output colored by response status for development use
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Configure CORS
// The origin should be an environment variable
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly define methods
    allowedHeaders: ['X-Requested-With', 'content-type', 'credentials', 'Authorization'], // Add Authorization if you use tokens
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRouter); // Use renamed variable
app.use('/api/phonenumber', phoneNumberRouter); // Use renamed variable
app.use('/api/upload', uploadRouter); // Use the upload router

// Global error handler
// This should be the last middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Optionally, include stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
