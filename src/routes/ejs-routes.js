import { Router } from "express";
import {
  bookingPage,
  processBookingRequest,
  confirmationPage,
  bookingsAdminPage,
} from "../controllers/bookings.js";

const router = Router();

// Customer Booking Lifecycle Routes
router.get("/routes/bookings/:scheduleId", bookingPage);
router.post("/routes/bookings", processBookingRequest);
router.get("/routes/confirmation/:bookingCode", confirmationPage);

// Admin Dashboard Route
router.get("/routes/bookings-admin", bookingsAdminPage);

export default router;