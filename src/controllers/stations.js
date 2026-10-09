import {
    getAllStations,
    getStationById,
    getTripById
} from '../models/model.js';

const getStations = async (req, res) => {
    try {
        const stations = await getAllStations();
        return res.status(200).json(stations);
    } catch (error) {
        console.error('GET /api/stations failed:', error.message);
        return res.status(500).json({ message: 'Unable to retrieve stations' });
    }
};

const getStation = async (req, res) => {
    try {
        const station = await getStationById(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }

        return res.status(200).json(station);
    } catch (error) {
        console.error('GET /api/stations/:id failed:', error.message);
        return res.status(500).json({ message: 'Unable to retrieve station' });
    }
};

const getTripStations = async (req, res) => {
    try {
        const trip = await getTripById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const [origin, destination] = await Promise.all([
            getStationById(trip.startStation),
            getStationById(trip.endStation)
        ]);

        return res.status(200).json({
            tripId: trip.id,
            stations: { origin, destination }
        });
    } catch (error) {
        console.error('GET /api/trips/:id/stations failed:', error.message);
        return res.status(500).json({ message: 'Unable to retrieve trip stations' });
    }
};

export { getStations, getStation, getTripStations };