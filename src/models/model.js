import { generateConfirmationCode } from '../includes/helpers.js';
import { getDb } from '../db/connect.js';

const collection = name => getDb().collection(name);
const findAll = name => collection(name).find({}).toArray();
const findOneById = (name, id) => {
    const values = [id];
    if (typeof id === 'string' && id.trim() !== '' && Number.isFinite(Number(id))) {
        values.push(Number(id));
    }
    return collection(name).findOne({ $or: values.map(value => ({ id: value })) });
};

// TRIP MODEL FUNCTIONS

export const getAllTrips = async () => findAll('trips');

export const getTripById = async (tripId) => findOneById('trips', tripId);

// STATION MODEL FUNCTIONS

export const getAllStations = async () => {
    return findAll('stations');
};

export const getStationById = async (stationId) => {
    return findOneById('stations', stationId);
};

export const getStationsByRegion = async (region) => {
    return collection('stations').find({ region: { $regex: `^${region}$`, $options: 'i' } }).toArray();
};

export const getStationsByPrefecture = async (prefecture) => {
    return collection('stations').find({ prefecture: { $regex: `^${prefecture}$`, $options: 'i' } }).toArray();
};

export const getStationsByFacility = async (facility) => {
    return collection('stations').find({ facilities: facility }).toArray();
};

// SCHEDULE MODEL FUNCTIONS

export const getAllSchedules = async () => {
    return findAll('schedules');
};

export const getScheduleById = async (scheduleId) => {
    return findOneById('schedules', scheduleId);
};

export const getSchedulesByTripId = async (tripId) => {
    return collection('schedules').find({ tripId }).toArray();
};

export const getAvailableSchedulesByTripId = async (tripId) => {
    return collection('schedules').find({ tripId, status: true }).toArray();
};

export const getSchedulesByDay = async (day) => {
    return collection('schedules').find({ daysOfWeek: day.toLowerCase() }).toArray();
};

export const getSchedulesByDepartureTime = async () => {
    return (await getAllSchedules()).sort((a, b) => {
        return a.departureTime.localeCompare(b.departureTime);
    });
};

// TICKET CLASS MODEL FUNCTIONS

export const getAllTicketClasses = async () => {
    return findAll('ticketClasses');
};

export const getTicketClassByName = async (className) => {
    return collection('ticketClasses').findOne({ class: { $regex: `^${className}$`, $options: 'i' } });
};

export const getTicketClassesByPrice = async () => {
    return (await getAllTicketClasses()).sort((a, b) => a.pricePerKm - b.pricePerKm);
};

// COMBINED/UTILITY MODEL FUNCTIONS

export const calculateTicketPrice = async (tripId, className) => {
    const trip = await getTripById(tripId);
    const ticketClass = await getTicketClassByName(className);

    if (!trip || !ticketClass) return null;

    return trip.distance * ticketClass.pricePerKm;
};

export const getTicketOptionsForTrip = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return null;

    const ticketClasses = await getAllTicketClasses();
    return ticketClasses.map(tc => ({
        class: tc.class,
        name: tc.name,
        price: trip.distance * tc.pricePerKm,
        amenities: tc.amenities,
        description: tc.description
    }));
};

export const getTicketOptionsForSchedule = async (scheduleId) => {
    const schedule = await getScheduleById(scheduleId);
    if (!schedule) return null;

    return getTicketOptionsForTrip(schedule.tripId);
};

export const isTripOperating = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return false;

    const currentMonth = new Date().getMonth() + 1;
    return trip.operatingMonths.includes(currentMonth);
};

export const getScheduleWithTrip = async (scheduleId) => {
    const schedule = await getScheduleById(scheduleId);
    if (!schedule) return null;

    const trip = await getTripById(schedule.tripId);

    return {
        ...schedule,
        tripDetails: trip
    };
};

export const searchTrips = async (keyword) => {
    const searchTerm = keyword.toLowerCase();
    const trips = await getAllTrips();
    return trips.filter(trip => {
        return (
            trip.name.toLowerCase().includes(searchTerm) ||
            trip.description.toLowerCase().includes(searchTerm) ||
            trip.highlights.some(highlight => highlight.toLowerCase().includes(searchTerm))
        );
    });
};

// CONFIRMATION MODEL FUNCTIONS

export const createConfirmation = async (confirmationData) => {
    const newConfirmation = {
        id: generateConfirmationCode(),
        createdAt: new Date().toISOString(),
        ...confirmationData
    };
    
    await collection('confirmations').insertOne(newConfirmation);
    
    return newConfirmation.id;
};

export const getConfirmationById = async (confirmationId) => {
    return collection('confirmations').findOne({ id: confirmationId });
};

export const getAllConfirmations = async () => {
    return findAll('confirmations');
};