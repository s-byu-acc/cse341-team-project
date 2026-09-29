import {
    getTripsPage as findTripsPage,
    getTripById as findTripById
} from "../models/trips.js";
import { getSchedulesByTripId } from "../models/schedule.js";

const getAllTrips = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
        const limit = Math.min(50, Math.max(1, requestedLimit));
        const region = typeof req.query.region === "string" && req.query.region !== "all"
            ? req.query.region.trim().toLowerCase()
            : "";
        const season = typeof req.query.season === "string" && req.query.season !== "all"
            ? req.query.season.trim().toLowerCase()
            : "";
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const sort = ["name", "createdAt"].includes(req.query.sort) ? req.query.sort : "name";
        const order = req.query.order === "desc" ? "desc" : "asc";
        const result = await findTripsPage({ page, limit, region, season, q, sort, order });

        return res.status(200).json({
            data: result.trips,
            query: { page: result.page, limit, region, season, q, sort, order },
            pagination: {
                page: result.page,
                limit,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                hasNextPage: result.page < result.totalPages,
                hasPreviousPage: result.page > 1
            },
            filters: { regions: result.regions, seasons: result.seasons }
        });
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

        details.schedules = await getSchedulesByTripId(details.id);

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