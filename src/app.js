const express = require('express');
const morgan = require('morgan'); // Import morgan
const cors = require('cors');
const authRouter = require('./routes/auth_route');
const phoneNumberRouter = require('./routes/client/phonenumberRoute'); // Renamed from veriphonenumber
const uploadRouter = require('./routes/upload_file_route'); // Import the new upload router

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { AppError } = require('./utils/errors'); // Import AppError
const env = require('./config/env'); // Import centralized env
const { genericApiLimiter } = require('./middlewares/rateLimit'); // Import rate limiter

const app = express();

// Apply generic rate limiter to all /api routes
app.use('/api', genericApiLimiter);

// Use morgan for request logging
// 'dev' format gives concise output colored by response status for development use
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Configure CORS
// The origin is now from the centralized env
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly define methods
    allowedHeaders: [
      'X-Requested-With',
      'content-type',
      'credentials',
      'Authorization',
    ], // Add Authorization if you use tokens
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', authRouter);
app.use('/api/phonenumber', phoneNumberRouter); // Use renamed variable
app.use('/api/upload', uploadRouter); // Use the upload router

// Serve Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
// This should be the last middleware
app.use((err, req, res, _next) => {
  if (err instanceof AppError) {
    // Operational, trusted error: send response to client
    if (env.NODE_ENV === 'development' || err.isOperational) {
      console.error(
        `AppError (${err.statusCode}): ${err.message}${err.isOperational ? '' : '\n' + err.stack}`,
      );
    }
    return res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error('UNHANDLED ERROR:', err); // Log the full error

  // Send generic message
  return res.status(500).json({
    success: false,
    status: 500,
    message: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && {
      errorDetails: { message: err.message, stack: err.stack },
    }), // Provide more detail in dev
  });
});

module.exports = app;
