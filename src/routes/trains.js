import { getDb } from '../db/connect.js';

const trainsPage = (req, res) => {
    res.render('trains', { title: 'Trains' });
};

const trainsApi = async (req, res, next) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
        const limit = Math.min(50, Math.max(1, requestedLimit));
        const collection = getDb().collection('trains');
        const [trains, totalItems] = await Promise.all([
            collection.find({})
                .sort({ name: 1, id: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray(),
            collection.countDocuments({})
        ]);
        const totalPages = Math.ceil(totalItems / limit);

        return res.json({
            trains,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1 && totalItems > 0
            }
        });
    } catch (error) {
        return next(error);
    }
};

export { trainsApi, trainsPage };
