import { getRouteById, getSchedulesByRoute } from '../models/model.js';


export default async (req, res) => {
    const { routeId } = req.params;
    const details = await getRouteById(routeId);
    if (!details) {
        return res.status(404).render('errors/404', {
            title: 'Route Not Found'
        });
    }


    details.schedules = await getSchedulesByRoute(routeId);


    // TODO: getCompleteRouteDetails instead


    return res.render('routes/details', {
        title: 'Route Details',
        details
    });
};
