import * as schedulesModel from '../models/schedule.js';

// Get /api/schedules
export const getSchedules = async (req, res, next) => {
    try {
        const schedules = await schedulesModel.getAllSchedules();
        return res.status(200).json(schedules);
    } catch (error) {
        return next(error);
    }
};

// Get /api/schedules/:id
export const getScheduleById = async (req, res, next) => {
    try {
        const schedule = await schedulesModel.getScheduleById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        return res.status(200).json(schedule);

    } catch (error) {
        return next(error);
    }
};

// Get /api/schedules/trip/:tripId
export const getSchedulesByTripId = async (req, res, next) => {
    try {
        const schedules = await schedulesModel.getSchedulesByTripId(req.params.tripId);
        return res.status(200).json(schedules);
    } catch (error) {
        return next(error);
    }
};

// Get /api/schedules/trip/:tripId/active
export const getActiveSchedulesByTripId = async (req, res, next) => {
    try {
        const schedules = await schedulesModel.getActiveSchedulesByTripId(req.params.tripId);
        return res.status(200).json(schedules);
    } catch (error) {
        return next(error);
    }
};

// Post /api/schedules
export const createSchedule = async (req, res, next) => {
    try {
        const {
    id, tripId, departureTime, arrivalTime, daysOfWeek, status } = req.body;    
        
    if(
        id === undefined ||
        !tripId ||
        !departureTime ||
        !arrivalTime ||
        !daysOfWeek ||
        !Array.isArray(daysOfWeek) ||
        !status
    ) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

        const scheduleData = await schedulesModel.createSchedule({
             id, tripId, departureTime, arrivalTime, daysOfWeek, status: status || true
        });
        return res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            data: scheduleData
        }); 
    } catch (error) {
        return next(error);
    }   
};

// Put /api/schedules/:id
export const updateSchedule = async (req, res, next) => {
    try {
        const scheduleData = await schedulesModel.updateSchedule(req.params.id, req.body);
        if (!scheduleData) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'Schedule updated successfully',
            data: scheduleData
        });
    } catch (error) {
        return next(error);
    }
};

// Delete /api/schedules/:id
export const deleteSchedule = async (req, res, next) => {
    try {
        const scheduleData = await schedulesModel.deleteSchedule(req.params.id);
        if (!scheduleData) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        return res.status(204).json({
            success: true,
            message: 'Schedule deleted successfully',
            data: scheduleData
        });
    } catch (error) {
        return next(error);
    }
};
