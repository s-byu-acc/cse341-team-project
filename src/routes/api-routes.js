import { Router } from "express";
import {
    getAllBookings,
    getSingleBooking,
    updateBooking,
    deleteBooking
} from "../controllers/bookings.js";

import {
    getSchedules,
    getScheduleById,
    getSchedulesByTripId,
    getActiveSchedulesByTripId,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from '../controllers/schedules.js';

import { getAllTrips, getTripById } from '../controllers/trips.js';
import { trainsApi } from './trains.js';
import { requireApiLogin, requireApiRole } from '../middleware/auth.js';

const router = Router();

router.get('/trains', trainsApi);

/**
 * @swagger
 * /api/trains:
 *   get:
 *     summary: Get a searchable, sorted page of trains
 *     tags: [Trains]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *       - in: query
 *         name: q
 *         description: Search train IDs, names, operators, types, power sources, and descriptions.
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [name, operator, type, speed, capacity, power], default: name }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: A page of trains and pagination metadata.
 *       500:
 *         description: Unable to retrieve trains.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AuthError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Authentication required
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         region:
 *           type: string
 *         startStation:
 *           type: string
 *         endStation:
 *           type: string
 *         duration:
 *           type: string
 *         distance:
 *           type: number
 *         highlights:
 *           type: array
 *           items:
 *             type: string
 *         bestSeason:
 *           type: string
 *         operatingMonths:
 *           type: array
 *           items:
 *             type: integer
 *         imageUrl:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Retrieve all bookings (Paginated)
 *     tags: [Bookings]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of bookings per page
 *       - in: query
 *         name: ticketClass
 *         schema:
 *           type: string
 *         description: Filter bookings by ticket class (e.g., premium, first, standard)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings created on or after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings created on or before this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: A paginated list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookingCode:
 *                         type: string
 *                       scheduleId:
 *                         type: string
 *                       tripId:
 *                         type: string
 *                       ticketClass:
 *                         type: string
 *                       selectedDay:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *       500:
 *         description: Server error
 *       401:
 *         description: Login is required
 */
router.get("/", requireApiLogin(), getAllBookings);

//Added in Wk06: Add Swagger annotations and route definition
/**
 * @swagger
 * /api/bookings/{bookingCode}:
 *   get:
 *     summary: Retrieve a single booking by bookingCode
 *     tags: [Bookings]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique booking code
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *       401:
 *         description: Login required
 *       403:
 *         description: Forbidden (customer accessing another user's booking)
 *       404:
 *         description: Booking not found
 */
router.get("/:bookingCode", requireApiLogin(), getSingleBooking);

/**
 * @openapi
 * /api/bookings/{bookingCode}:
 *   put:
 *     summary: Update a booking owned by the signed-in user (or any booking as an admin)
 *     tags: [Bookings]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduleId, tripId, ticketClass, selectedDay, totalAmount, passengers]
 *             properties:
 *               scheduleId: { type: string }
 *               tripId: { type: string }
 *               ticketClass: { type: string }
 *               selectedDay: { type: string }
 *               totalAmount: { type: number }
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Booking updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   type: object
 *       400:
 *         description: Invalid booking data.
 *       401:
 *         description: Login is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       403:
 *         description: The booking does not belong to the signed-in user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Error updating booking.
 */
router.put('/:bookingCode', requireApiLogin(), updateBooking);

/**
 * @openapi
 * /api/bookings/{bookingCode}:
 *   delete:
 *     summary: Delete a booking owned by the signed-in user (or any booking as an admin)
 *     tags: [Bookings]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Booking deleted }
 *                 bookingCode: { type: string }
 *       401:
 *         description: Login is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       403:
 *         description: The booking does not belong to the signed-in user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Error deleting booking.
 */
router.delete('/:bookingCode', requireApiLogin(), deleteBooking);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get a filtered page of trips
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by trip region.
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *         description: Filter by best season.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search trip names and descriptions.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, createdAt]
 *           default: name
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: A page of trips and pagination metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *                 query:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     region:
 *                       type: string
 *                     season:
 *                       type: string
 *                     q:
 *                       type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *                 filters:
 *                   type: object
 *                   properties:
 *                     regions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     seasons:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Unable to retrieve trips.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/trips', getAllTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique trip identifier.
 *     responses:
 *       200:
 *         description: The requested trip.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Unable to retrieve trip.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/trips/:id', getTripById);


/**
 * @openapi
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - id
 *         - tripId
 *         - departureTime
 *         - arrivalTime
 *         - daysOfWeek
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique numeric identifier for the schedule.
 *           example: 1
 *         tripId:
 *           type: string
 *           description: Identifier of the trip served by this schedule.
 *           example: alpine-panorama
 *         departureTime:
 *           type: string
 *           description: Departure time in HH:mm format.
 *           example: 08:30
 *         arrivalTime:
 *           type: string
 *           description: Arrival time in HH:mm format.
 *           example: 13:00
 *         daysOfWeek:
 *           type: array
 *           description: Days on which the schedule operates.
 *           items:
 *             type: string
 *           example: [monday, tuesday, wednesday, thursday, friday]
 *         status:
 *           type: boolean
 *           description: Whether the schedule is active.
 *           default: true
 *           example: true
 *     ScheduleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Schedule created successfully
 *         data:
 *           $ref: '#/components/schemas/Schedule'
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Schedule not found
 */

/**
 * @openapi
 * /api/schedules:
 *   get:
 *     summary: Get all schedules
 *     tags:
 *       - Schedules
 *     responses:
 *       '200':
 *         description: A list of schedules.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get('/schedules', getSchedules);

/**
 * @openapi
 * /api/schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     tags:
 *       - Schedules
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric schedule identifier.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       '200':
 *         description: The requested schedule.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       '404':
 *         description: Schedule not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @openapi
 * /api/schedules/trip/{tripId}:
 *   get:
 *     summary: Get schedules for a trip
 *     tags:
 *       - Schedules
 *     parameters:
 *       - name: tripId
 *         in: path
 *         required: true
 *         description: Trip identifier.
 *         schema:
 *           type: string
 *         example: alpine-panorama
 *     responses:
 *       '200':
 *         description: Schedules belonging to the trip.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get('/schedules/trip/:tripId', getSchedulesByTripId);

/**
 * @openapi
 * /api/schedules/trip/{tripId}/active:
 *   get:
 *     summary: Get active schedules for a trip
 *     tags:
 *       - Schedules
 *     parameters:
 *       - name: tripId
 *         in: path
 *         required: true
 *         description: Trip identifier.
 *         schema:
 *           type: string
 *         example: alpine-panorama
 *     responses:
 *       '200':
 *         description: Active schedules belonging to the trip.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get('/schedules/trip/:tripId/active', getActiveSchedulesByTripId);

/**
 * @openapi
 * /api/schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     tags:
 *       - Schedules
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric schedule identifier.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       '200':
 *         description: The requested schedule.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       '404':
 *         description: Schedule not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/schedules/:id', getScheduleById);

/**
 * @openapi
 * /api/schedules:
 *   post:
 *     summary: Create a schedule
 *     tags:
 *       - Schedules
 *     security:
 *       - sessionCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       '201':
 *         description: Schedule created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleResponse'
 *       '400':
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Login is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       '403':
 *         description: The signed-in user must have the admin role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 */
router.post('/schedules', requireApiRole('admin'), createSchedule);

/**
 * @openapi
 * /api/schedules/{id}:
 *   put:
 *     summary: Update a schedule
 *     tags:
 *       - Schedules
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric schedule identifier.
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       '200':
 *         description: Schedule updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleResponse'
 *       '404':
 *         description: Schedule not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Login is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       '403':
 *         description: The signed-in user must have the admin role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 */
router.put('/schedules/:id', requireApiRole('admin'), updateSchedule);

/**
 * @openapi
 * /api/schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags:
 *       - Schedules
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric schedule identifier.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       '204':
 *         description: Schedule deleted successfully.
 *       '404':
 *         description: Schedule not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Login is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       '403':
 *         description: The signed-in user must have the admin role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 */
router.delete('/schedules/:id', requireApiRole('admin'), deleteSchedule);

export default router;