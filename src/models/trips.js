import mongoose from "mongoose";
import Trip from "./schemas/trips.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getTripsPage = async ({ page, limit, region, season, q, sort, order }) => {
    const filter = {};

    if (region) {
        filter.region = region;
    }

    if (season) {
        filter.bestSeason = season;
    }

    if (q) {
        const search = new RegExp(escapeRegex(q), "i");
        filter.$or = [{ name: search }, { description: search }];
    }

    const [totalItems, regions, seasons] = await Promise.all([
        Trip.countDocuments(filter).exec(),
        Trip.distinct("region").exec(),
        Trip.distinct("bestSeason").exec()
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const sortDirection = order === "desc" ? -1 : 1;
    const trips = await Trip.find(filter)
        .sort({ [sort]: sortDirection, id: sortDirection })
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

    return {
        trips,
        totalItems,
        totalPages,
        page: currentPage,
        regions: regions.sort(),
        seasons: seasons.sort()
    };
};

const getTripById = async (requestedId) => {
    if (typeof requestedId !== "string" || requestedId.trim() === "") {
        return null;
    }

    try {
        const trip = await Trip.findOne({ id: requestedId.trim() }).lean().exec();
        return trip;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return null;
        }

        console.error("Error retrieving trip:", error.message);
        return null;
    }
};

export { getTripsPage, getTripById };