import challengeScenariosRouter from './scenarios.js';
import railRoutesRouter from './routes.js';
import apiRouter from './api-routes.js';
import tripsRouter from './trips.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';

const router = Router();

router.use('/api', apiRouter);

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Rail routes
router.use('/routes', railRoutesRouter);

// Trips backed by the trips API.
router.use('/trips', tripsRouter);

// Challenge scenarios
router.use('/scenarios', challengeScenariosRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;