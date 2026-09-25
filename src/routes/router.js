import { Router } from 'express';
import challengeScenariosRouter from './scenarios.js';
import railRoutesRouter from './routes.js';
import tripsRouter from './trips.js';
import { homePage, aboutPage, testErrorPage } from './index.js';

const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Rail routes & Booking flow (/routes/...)
router.use('/routes', railRoutesRouter);

// Trips backed by the trips API.
router.use('/trips', tripsRouter);

// Challenge scenarios
router.use('/scenarios', challengeScenariosRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;