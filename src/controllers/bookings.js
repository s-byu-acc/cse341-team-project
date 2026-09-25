
import {
  createBooking,
  getAllBookings as findAllBookings,
  getBookingById
} from '../models/bookings.js';

import {
  getScheduleWithRoute,
  getTicketOptionsForSchedule,
  getAllTicketClasses
} from '../models/model.js';

// --- EJS VIEW CONTROLLERS ---

// 1. Render Booking Page (src/views/trips/book.ejs)
export const bookingPage = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await getScheduleWithRoute(scheduleId);
    if (!schedule) {
      return res.status(404).send('Schedule not found');
    }

    const ticketOptions = await getTicketOptionsForSchedule(scheduleId);
    const ticketClasses = await getAllTicketClasses();

    return res.render('trips/book', {
      title: 'Book Trip',
      schedule,
      route: schedule.routeDetails,
      ticketOptions,
      ticketClasses
    });
  } catch (error) {
    console.error('Error rendering booking page:', error);
    return res.status(500).send('Server Error');
  }
};

// 2. Process Booking Form Submission & Save to MongoDB
export const processBookingRequest = async (req, res) => {
  try {
    // Pass form body directly to model helper
    const savedBooking = await createBooking(req.body);

    // Redirect to confirmation route using new bookingCode
    return res.redirect(`/routes/confirmation/${savedBooking.bookingCode}`);
  } catch (error) {
    console.error('Error saving booking to MongoDB:', error);
    return res.status(500).send('Failed to process booking');
  }
};

// 3. Fetch Confirmation Details from MongoDB & Render Confirmation EJS
// (src/views/trip/confirm.ejs)
export const confirmationPage = async (req, res) => {
  try {
    const bookingCode = req.params.bookingCode || req.params.confirmationId;

    // Fetch saved document from MongoDB via Model
    const confirmation = await getBookingById(bookingCode);

    if (!confirmation) {
      return res.status(404).send('Booking confirmation not found');
    }

    return res.render('trips/confirm', {
      title: 'Trip Confirmation',
      confirmation,
      booking: confirmation
    });
  } catch (error) {
    console.error('Error fetching confirmation from MongoDB:', error);
    return res.status(500).send('Error loading confirmation page');
  }
};

// 4. API Controller: Get All Bookings for Swagger & Web Services
export async function getAllBookings(req, res) {
  try {
    const bookings = await findAllBookings();
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error getting bookings API:', error);
    return res.status(500).json({ error: 'Error retrieving bookings' });
  }
}

// 5. Render Admin Page
export const bookingsAdminPage = async (req, res) => {
  try {
    const confirmations = await findAllBookings();
    return res.render('booking', {
      title: 'Bookings Administration',
      confirmations
    });
  } catch (error) {
    console.error('Error rendering admin page:', error);
    return res.status(500).send('Server Error');
  }
};

