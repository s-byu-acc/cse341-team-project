import { Router } from 'express';
import challengeScenariosRouter from './scenarios.js';
import tripsRouter from './trips.js';
import authRouter from './auth.js';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { bookingsAdminPage } from '../controllers/bookings.js';
import { requirePageRole } from '../middleware/auth.js';
import { trainsPage } from './trains.js';

const router = Router();

router.get('/admin', requirePageRole('admin'), (req, res) => {
	res.render('admin', { title: 'Admin Dashboard' });
});
router.get('/bookings-admin', requirePageRole('admin'), bookingsAdminPage);

// Home page
router.get('/', homePage);

router.use('/', authRouter);

// About page
router.get('/about', aboutPage);

// Train catalog
router.get('/trains', trainsPage);

// Trips backed by the trips API.
router.use('/trips', tripsRouter);

// Challenge scenarios
router.use('/scenarios', challengeScenariosRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;