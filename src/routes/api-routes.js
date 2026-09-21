import {
  getAllTicketClasses,
  getTicketClassesForDay
} from '../controllers/ticket-classes.js';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/ticket-classes:
 *   get:
 *     summary: Get ticket classes
 *     description: Returns all ticket classes, or only the classes available on a specific day when the day query parameter is provided.
 *     tags:
 *       - Ticket Classes
 *     parameters:
 *       - in: query
 *         name: day
 *         required: false
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *         description: Day of the week to filter by (case-insensitive).
 *     responses:
 *       200:
 *         description: A list of ticket classes (empty array if none match).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketClass'
 *       400:
 *         description: Invalid day value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/ticket-classes', (req, res) =>
  req.query.day !== undefined
    ? getTicketClassesForDay(req, res)
    : getAllTicketClasses(req, res)
);

export default router;