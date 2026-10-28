import {
    getAllStations as findAllStations,
    getStationById as findStationById,
    getTripById as findTripById
} from '../models/model.js';

export const getAllStations = async (req, res, next) => {
    try {
        const stations = await findAllStations();
        return res.status(200).json(stations);
    } catch (error) {
        return next(error);
    }
};

export const getStationById = async (req, res, next) => {
    try {
        const station = await findStationById(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }
        return res.status(200).json(station);
    } catch (error) {
        return next(error);
    }
};

export const getTripStations = async (req, res, next) => {
    try {
        const trip = await findTripById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const [origin, destination] = await Promise.all([
            findStationById(trip.startStation),
            findStationById(trip.endStation)
        ]);

        if (!origin || !destination) {
            return res.status(404).json({ message: 'Trip station not found' });
        }

        return res.status(200).json({
            tripId: trip.id,
            origin,
            destination
        });
    } catch (error) {
        return next(error);
    }
};