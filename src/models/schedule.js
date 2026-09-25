import { getDb } from '../db/connect.js';

const schedules = () => getDb().collection('schedules');

const idQuery = id => {
    const values = [id];
    if (typeof id === 'string' && id.trim() !== '' && Number.isFinite(Number(id))) {
        values.push(Number(id));
    }
    return { $or: values.map(value => ({ id: value })) };
};

// Get all schedules
export const getAllSchedules = async () => {
    return schedules().find({}).sort({ departureTime: 1 }).toArray();
};

// Get a schedule by ID
export const getScheduleById = async (id) => {
    return schedules().findOne(idQuery(id));
};

// Get all schedules belonging to a trip
export const getSchedulesByTripId = async (tripId) => {
    return schedules().find({ $or: [{ tripId }, { routeId: tripId }] })
        .sort({ departureTime: 1 }).toArray();
};

// Get only active trips for a schedule
export const getActiveSchedulesByTripId = async (tripId) => {
    return schedules().find({ $or: [{ tripId }, { routeId: tripId }], status: true })
        .sort({ departureTime: 1 }).toArray();
};

// Create a new schedule
export const createSchedule = async (scheduleData) => {
    const schedule = {
        ...scheduleData,
        routeId: scheduleData.tripId || scheduleData.routeId,
        status: scheduleData.status ?? true
    };
    await schedules().insertOne(schedule);
    return schedule;
};

// Update a schedule by ID
export const updateSchedule = async (id, scheduleData) => {
    return schedules().findOneAndUpdate(
        idQuery(id),
        { $set: scheduleData },
        { returnDocument: 'after' }
    );
};

// Delete a schedule by ID
export const deleteSchedule = async (id) => {
    return schedules().findOneAndDelete(idQuery(id));
};

