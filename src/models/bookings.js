import Booking from './schemas/bookings.js';

/**
 * 1. Creating and saving a new booking document to MongoDB
 */
export async function createBooking(bookingData) {
  // Generate a unique code starting with JRD
  const bookingCode = 'JRD' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const newBooking = new Booking({
    bookingCode,
    scheduleId: bookingData.scheduleId || '1',
    tripId: bookingData.tripId || '1',
    ticketClass: bookingData.ticketClass || 'Standard',
    selectedDay: bookingData.selectedDay || 'Today',
    passengers: [
      {
        firstName: bookingData.firstName || 'Guest',
        lastName: bookingData.lastName || 'Passenger',
        email: bookingData.email || 'passenger@example.com',
        phone: bookingData.phone || '000-000-0000'
      }
    ],
    totalAmount: bookingData.totalAmount || 27000
  });

  const savedBooking = await newBooking.save();
  return savedBooking.toObject();
}

/**
 * 2. Fetching all bookings from MongoDB sorted newest first
 * Wk05-feature-3: Updated to add pagination
 */
export const getAllBookings = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Run both the data fetch and the total count fetch at the same time for performance
  const [data, totalItems] = await Promise.all([
    Booking.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments()
  ]);
  
  return { data, totalItems };
};

/**
 * 3. Fetch bookings with at least one passenger matching the user's email.
 * Wk05-feature-3: Updated to add pagination
 */
export const getBookingsByPassengerEmail = async (email, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { 
    passengers: { $elemMatch: { email: email.toLowerCase() } } 
  };
  
  const [data, totalItems] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments(query)
  ]);
  
  return { data, totalItems };
};

export async function updateBookingById(bookingCode, bookingData) {
  return Booking.findOneAndUpdate(
    { bookingCode },
    { $set: bookingData },
    { new: true, runValidators: true }
  ).lean();
}

export async function deleteBookingById(bookingCode) {
  return Booking.findOneAndDelete({ bookingCode }).lean();
}

/**
 * 4. Fetching a single booking by its generated booking code
 */
export async function getBookingById(bookingCode) {
  return Booking.findOne({ bookingCode }).lean();
}