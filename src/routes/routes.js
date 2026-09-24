import { Router } from 'express';

// Import existing route handlers
import listRoutes from './list.js';
import routeDetails from './details.js';

// Import booking controllers
import {
  getAllBookings,
  bookingPage,
  processBookingRequest,
  confirmationPage,
  bookingsAdminPage,
} from '../controllers/bookings.js';

const router = Router();

// 1. List all train routes (/routes)
router.get('/', listRoutes);

// 2.EJS View Routes: Booking flow static routes
router.get('/booking/:scheduleId', bookingPage);
router.post('/book', processBookingRequest);
router.get('/confirmation/:bookingCode', confirmationPage);

// 3. Admin & Swagger API endpoints
router.get('/bookings-admin', bookingsAdminPage);
router.get('/api/bookings', getAllBookings);

// 4. Dynamic route detail page such as /routes/alpine-panorama.
//Remain at the bottom so static paths above are checked first!
router.get('/:routeId', routeDetails);

export default router;