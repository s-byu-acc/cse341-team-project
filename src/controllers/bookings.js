
import {
  createBooking,
  getAllBookings as findAllBookings,
  getBookingById,
  getBookingsByPassengerEmail as findBookingsByPassengerEmail,
  updateBookingById,
  deleteBookingById
} from '../models/bookings.js';

import {
  getScheduleWithTrip,
  getTicketOptionsForSchedule,
  getAllTicketClasses
} from '../models/model.js';

// --- EJS VIEW CONTROLLERS ---

// 1. Render Booking Page (src/views/trips/book.ejs)
export const bookingPage = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await getScheduleWithTrip(scheduleId);
    if (!schedule) {
      return res.status(404).send('Schedule not found');
    }

    const ticketOptions = await getTicketOptionsForSchedule(scheduleId);
    const ticketClasses = await getAllTicketClasses();

    return res.render('trips/book', {
      title: 'Book Trip',
      schedule,
      trip: schedule.tripDetails,
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
    return res.redirect(`/trips/confirmation/${savedBooking.bookingCode}`);
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
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const bookings = req.user.role === 'admin'
      ? await findAllBookings()
      : await findBookingsByPassengerEmail(req.user.email);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error getting bookings API:', error);
    return res.status(500).json({ error: 'Error retrieving bookings' });
  }
}

const canManageBooking = (user, booking) => {
  if (user.role === 'admin') {
    return true;
  }

  const userEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  return userEmail !== '' && booking.passengers?.some((passenger) =>
    typeof passenger.email === 'string' && passenger.email.trim().toLowerCase() === userEmail
  );
};

const validateBookingUpdate = (body) => {
  const fields = ['scheduleId', 'tripId', 'ticketClass', 'selectedDay', 'totalAmount', 'passengers'];
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (fields.some((field) => !Object.hasOwn(body, field)) || Object.keys(body).some((field) => !fields.includes(field))) {
    return null;
  }

  const textFields = ['scheduleId', 'tripId', 'ticketClass', 'selectedDay'];
  if (textFields.some((field) => typeof body[field] !== 'string' || !body[field].trim())) {
    return null;
  }
  if (typeof body.totalAmount !== 'number' || !Number.isFinite(body.totalAmount) || body.totalAmount < 0) {
    return null;
  }
  if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
    return null;
  }

  const passengerFields = ['firstName', 'lastName', 'email', 'phone'];
  const passengers = body.passengers.map((passenger) => {
    if (!passenger || typeof passenger !== 'object' || Array.isArray(passenger)) return null;
    if (passengerFields.some((field) => typeof passenger[field] !== 'string' || !passenger[field].trim())) {
      return null;
    }
    if (Object.keys(passenger).some((field) => !passengerFields.includes(field))) return null;

    return Object.fromEntries(passengerFields.map((field) => [field, passenger[field].trim()]));
  });

  if (passengers.some((passenger) => passenger === null)) return null;

  return {
    scheduleId: body.scheduleId.trim(),
    tripId: body.tripId.trim(),
    ticketClass: body.ticketClass.trim(),
    selectedDay: body.selectedDay.trim(),
    totalAmount: body.totalAmount,
    passengers
  };
};

export async function updateBooking(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const booking = await getBookingById(req.params.bookingCode);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!canManageBooking(req.user, booking)) {
      return res.status(403).json({ error: 'You are not authorized to update this booking' });
    }

    const bookingData = validateBookingUpdate(req.body);
    if (!bookingData) {
      return res.status(400).json({ error: 'Invalid booking data' });
    }

    const updatedBooking = await updateBookingById(req.params.bookingCode, bookingData);
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Error updating booking' });
  }
}

export async function deleteBooking(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const booking = await getBookingById(req.params.bookingCode);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!canManageBooking(req.user, booking)) {
      return res.status(403).json({ error: 'You are not authorized to delete this booking' });
    }

    const deletedBooking = await deleteBookingById(req.params.bookingCode);
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({ message: 'Booking deleted', bookingCode: deletedBooking.bookingCode });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: 'Error deleting booking' });
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

