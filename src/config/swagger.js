const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telecom Project API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Telecom Project backend.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Replace with your server URL
        description: 'Development server',
      },
      // You can add more servers here (e.g., staging, production)
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'integer', description: 'HTTP status code' },
            message: { type: 'string', description: 'Error message' },
            // Optionally include stack in development
            // stack: { type: 'string', description: 'Error stack (in development)' }
          },
          required: ['success', 'status', 'message'],
        },
        UserResponse: { // Added UserResponse schema
          type: 'object',
          properties: {
            _id: { type: 'string', description: "User's unique ID" },
            fullname: { type: 'string', description: "User's full name" },
            email: { type: 'string', format: 'email', description: "User's email address" },
            role: { type: 'string', description: "User's role" },
            isEmailVerified: { type: 'boolean', description: 'Email verification status' },
            tenantId: { type: 'string', description: 'ID of the tenant the user belongs to', nullable: true },
            created_at: { type: 'string', format: 'date-time', description: 'Timestamp of user creation' },
            updated_at: { type: 'string', format: 'date-time', description: 'Timestamp of last user update' },
          }
        }
      },
    },
    // You can apply global security here if most/all endpoints are protected
    // security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
    './src/routes/*/*.js',
    './src/controllers/**/*.js',
  ], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
