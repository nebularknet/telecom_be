const express = require("express");
const morgan = require('morgan'); // Import morgan
const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const phoneNumberRouter = require('./routes/phonenumber.routes'); // Renamed from veriphonenumber
const uploadRouter = require('./routes/uploadfile.routes'); // Import the new upload router
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const stripeRoutes = require('./routes/paymentStripe.routes')
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

// API Routes
app.use("/api/auth", authRouter);
app.use('/api/phonenumber', phoneNumberRouter); // Use renamed variable
app.use('/api/upload', uploadRouter); // Use the upload router
app.use('/api/payment', stripeRoutes);
// Serve Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
// This should be the last middleware
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
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
