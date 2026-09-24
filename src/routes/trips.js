import { bookingPage, processBookingRequest } from './book.js';
import confirmationPage from './confirm.js';
import {
	getTripDetailsPage as tripDetailsPage,
	getTripsPage as tripsPage
} from '../controllers/trips.js';
import { Router } from 'express';

const router = Router();

router.get('/', tripsPage);

// Book ticket
router.get('/booking/:scheduleId', bookingPage);
router.post('/book', processBookingRequest);

// Booking confirmation page
router.get('/confirmation/:confirmationId', confirmationPage);

// Trip details page
router.get('/:tripId', tripDetailsPage);

export default router;
