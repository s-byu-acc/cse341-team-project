import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import challengeScenariosRouter from './scenarios.js';
import railRoutesRouter from './routes.js';
import { homePage, aboutPage, testErrorPage } from './index.js';

const router = Router();

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kizuna Rail API',
      version: '1.0.0',
      description: 'API Documentation for Kizuna Rail booking application',
    },
    servers: [
      {
        url: 'http://127.0.0.1:3000',
        description: 'Local Server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path where your Swagger annotations are located
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger Documentation Route
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Rail routes & Booking flow (/routes/...)
router.use('/routes', railRoutesRouter);

// Challenge scenarios
router.use('/scenarios', challengeScenariosRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;