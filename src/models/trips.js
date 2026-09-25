import mongoose from "mongoose";
import Trip from "./schemas/trips.js";

const getAllTrips = async () => {
    try {
        const trips = await Trip.find({}).lean().exec();
        return trips;
    } catch (error) {
        console.error("Error retrieving trips:", error.message);
        return [];
    }
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

export { getAllTrips, getTripById };