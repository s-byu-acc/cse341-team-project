import { Router } from 'express';

import {
    getSchedules,
    getScheduleById,
    getSchedulesByTripId,
    getActiveSchedulesByTripId,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from '../controllers/schedules.js';

const router = Router();

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
 */
router.post('/schedules', createSchedule);

/**
 * @openapi
 * /api/schedules/{id}:
 *   put:
 *     summary: Update a schedule
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
 */
router.put('/schedules/:id', updateSchedule);

/**
 * @openapi
 * /api/schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
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
 *       '204':
 *         description: Schedule deleted successfully.
 *       '404':
 *         description: Schedule not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/schedules/:id', deleteSchedule);

export default router;