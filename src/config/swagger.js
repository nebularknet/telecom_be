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
    ],
  },
  apis: ['./src/routes/*.js', './src/routes/**/*.js','./src/routes/*/*.js', './src/controllers/**/*.js'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
