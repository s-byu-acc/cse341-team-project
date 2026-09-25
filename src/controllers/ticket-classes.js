import {
  getAllTicketClasses as fetchAllTicketClasses,
  getTicketClassesForDay as fetchTicketClassesForDay
} from '../models/ticket-classes.js';

const VALID_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export async function getAllTicketClasses(req, res) {
  try {
    const ticketClasses = await fetchAllTicketClasses();
    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error('Error fetching ticket classes:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket classes' });
  }
}

export async function getTicketClassesForDay(req, res) {
  const day = String(req.query.day || '').toLowerCase();

  if (!VALID_DAYS.includes(day)) {
    return res.status(400).json({
      error: `Invalid day. Must be one of: ${VALID_DAYS.join(', ')}`
    });
  }

  try {
    const ticketClasses = await fetchTicketClassesForDay(day);
    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error('Error fetching ticket classes for day:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket classes for day' });
  }
}