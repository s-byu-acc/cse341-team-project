import { Router } from 'express';
import {
  bookingPage,
  processBookingRequest,
  confirmationPage
} from '../controllers/bookings.js';
import {
  getTripDetailsPage as tripDetailsPage,
  getTripsPage as tripsPage
} from '../controllers/trips.js';

const router = Router();

// 1. List all trips
router.get('/', tripsPage);

// 2. Specific booking routes comes before /:tripId
router.get('/booking/:scheduleId', bookingPage);
router.post('/book', processBookingRequest);
router.get('/confirmation/:confirmationId', confirmationPage);

// 3. Wildcard trip details page must be at the bottom
router.get('/:tripId', tripDetailsPage);

export default router;
