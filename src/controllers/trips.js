import {
    getAllTrips as findAllTrips,
    getTripById as findTripById
} from "../models/trips.js";

const getAllTrips = async (req, res) => {
    try {
        const trips = await findAllTrips();
        return res.status(200).json(trips);
    } catch (error) {
        console.error("GET /api/trips failed:", error.message);
        return res.status(500).json({ message: "Unable to retrieve trips" });
    }
};

const getTripById = async (req, res) => {
    try {
        const { id: requestedId } = req.params;
        const trip = await findTripById(requestedId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        return res.status(200).json(trip);
    } catch (error) {
        console.error("GET /api/trips/:id failed:", error.message);
        return res.status(500).json({ message: "Unable to retrieve trip" });
    }
};

const getTripDetailsPage = async (req, res, next) => {
    try {
        const details = await findTripById(req.params.tripId);

        if (!details) {
            return res.status(404).render('errors/404', {
                title: 'Trip Not Found'
            });
        }

        return res.render('trips/details', {
            title: details.name,
            details
        });
    } catch (error) {
        console.error('GET /trips/:tripId failed:', error.message);
        return next(error);
    }
};

const getTripsPage = async (req, res) => {
    return res.render('trips/list', {
        title: 'Scenic Train Trips'
    });
};

export { getAllTrips, getTripById, getTripDetailsPage, getTripsPage };