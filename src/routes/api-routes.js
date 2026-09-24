import { Router } from "express";
import { getAllBookings } from "../controllers/bookings.js";

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Retrieve all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of all customer bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookingCode:
 *                     type: string
 *                   scheduleId:
 *                     type: string
 *                   routeId:
 *                     type: string
 *                   ticketClass:
 *                     type: string
 *                   selectedDay:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *       500:
 *         description: Server error
 */
router.get("/", getAllBookings);

export default router;