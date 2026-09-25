import { writeFileSync } from 'node:fs';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Train Booking API',
      version: '1.0.0',
      description: 'API for managing train schedules, routes, and ticket bookings'
    },
    servers: [
      {
        url: '/',
        description: 'Current Server'
      }
    ]
  },
  // Scan all route files inside src/routes/ so @swagger comments are found
  apis: ['./src/routes/*.js', './src/router.js', './app.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);
writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger documentation generated successfully.');
