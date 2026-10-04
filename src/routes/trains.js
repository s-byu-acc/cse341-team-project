import { getDb } from '../db/connect.js';

const trainsPage = (req, res) => {
    res.render('trains', { title: 'Trains' });
};

const trainsApi = async (req, res, next) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
        const limit = Math.min(50, Math.max(1, requestedLimit));
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const sortFields = {
            name: 'name',
            operator: 'operator',
            type: 'type',
            speed: 'maxSpeedKmh',
            capacity: 'capacity',
            power: 'powerSource'
        };
        const sort = Object.hasOwn(sortFields, req.query.sort) ? req.query.sort : 'name';
        const order = req.query.order === 'desc' ? 'desc' : 'asc';
        const filter = q
            ? {
                $or: ['id', 'name', 'operator', 'type', 'powerSource', 'bestFor', 'description'].map((field) => ({
                    [field]: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
                }))
            }
            : {};
        const collection = getDb().collection('trains');
        const [trains, totalItems] = await Promise.all([
            collection.find(filter)
                .sort({ [sortFields[sort]]: order === 'desc' ? -1 : 1, id: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray(),
            collection.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(totalItems / limit);

        return res.json({
            trains,
            query: { page, limit, q, sort, order },
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
