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

// ROUTE MODEL FUNCTIONS

export const getAllRoutes = async () => {
    return findAll('routes');
};

export const getListOfRegions = async () => {
    const regions = new Set((await getAllRoutes()).map(route => route.region));
    return Array.from(regions);
};

export const getListOfSeasons = async () => {
    const seasons = new Set((await getAllRoutes()).map(route => route.bestSeason));
    return Array.from(seasons);
};

export const getRouteById = async (routeId) => {
    return findOneById('routes', routeId);
};

export const getRoutesByRegion = async (region) => {
    return collection('routes').find({ region: { $regex: `^${region}$`, $options: 'i' } }).toArray();
};

export const getRoutesBySeason = async (season) => {
    return collection('routes').find({ bestSeason: { $regex: `^${season}$`, $options: 'i' } }).toArray();
};

export const getRoutesByMonth = async (month) => {
    return collection('routes').find({ operatingMonths: month }).toArray();
};

export const getRoutesByDuration = async () => {
    return (await getAllRoutes()).sort((a, b) => {
        const aDuration = parseFloat(a.duration);
        const bDuration = parseFloat(b.duration);
        return aDuration - bDuration;
    });
};

export const getRoutesByDistance = async () => {
    return (await getAllRoutes()).sort((a, b) => a.distance - b.distance);
};

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

export const getSchedulesByRoute = async (routeId) => {
    return collection('schedules').find({ routeId }).toArray();
};

export const getAvailableSchedulesByRoute = async (routeId) => {
    return collection('schedules').find({ routeId, status: true }).toArray();
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

export const getRouteWithStations = async (routeId) => {
    const route = await getRouteById(routeId);
    if (!route) return null;

    const startStation = await getStationById(route.startStation);
    const endStation = await getStationById(route.endStation);

    return {
        ...route,
        startStationDetails: startStation,
        endStationDetails: endStation
    };
};

export const getRouteWithSchedules = async (routeId) => {
    const route = await getRouteById(routeId);
    if (!route) return null;

    const routeSchedules = await getSchedulesByRoute(routeId);

    return {
        ...route,
        schedules: routeSchedules
    };
};

export const getCompleteRouteDetails = async (routeId) => {
    const route = await getRouteById(routeId);
    if (!route) return null;

    const startStation = await getStationById(route.startStation);
    const endStation = await getStationById(route.endStation);
    const routeSchedules = await getSchedulesByRoute(routeId);

    return {
        ...route,
        startStationDetails: startStation,
        endStationDetails: endStation,
        schedules: routeSchedules
    };
};

export const calculateTicketPrice = async (routeId, className) => {
    const route = await getRouteById(routeId);
    const ticketClass = await getTicketClassByName(className);

    if (!route || !ticketClass) return null;

    return route.distance * ticketClass.pricePerKm;
};

export const getTicketOptionsForRoute = async (routeId) => {
    const route = await getRouteById(routeId);
    if (!route) return null;

    const ticketClasses = await getAllTicketClasses();
    return ticketClasses.map(tc => ({
        class: tc.class,
        name: tc.name,
        price: route.distance * tc.pricePerKm,
        amenities: tc.amenities,
        description: tc.description
    }));
};

export const getTicketOptionsForSchedule = async (scheduleId) => {
    const schedule = await getScheduleById(scheduleId);
    if (!schedule) return null;

    return getTicketOptionsForRoute(schedule.routeId);
};

export const isRouteOperating = async (routeId) => {
    const route = await getRouteById(routeId);
    if (!route) return false;

    const currentMonth = new Date().getMonth() + 1;
    return route.operatingMonths.includes(currentMonth);
};

export const getScheduleWithRoute = async (scheduleId) => {
    const schedule = await getScheduleById(scheduleId);
    if (!schedule) return null;

    const route = await getRouteById(schedule.routeId);

    return {
        ...schedule,
        routeDetails: route
    };
};

export const searchRoutes = async (keyword) => {
    const searchTerm = keyword.toLowerCase();
    const routes = await getAllRoutes();
    return routes.filter(route => {
        return (
            route.name.toLowerCase().includes(searchTerm) ||
            route.description.toLowerCase().includes(searchTerm) ||
            route.highlights.some(highlight => highlight.toLowerCase().includes(searchTerm))
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