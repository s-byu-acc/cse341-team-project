//This file to define my endpoints and place the commented-out Feature 1 hooks.
import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userAdmin.js';
// TODO Later: Uncomment these imports when Feature 1 is merged
// import { requireApiLogin, requirePageLogin, requireApiRole } from '../middleware/auth.js';

const userAdminRouter = Router();

// --- PAGE ROUTE ---
// TODO Later: Complete requirePageLogin middleware here: router.get('/admin/users', requirePageLogin, (req, res) => ...
userAdminRouter.get('/admin/users', (req, res) => {
    res.render('users', { title: 'User Administration' });
});

// --- API ROUTES ---
// TODO Later: Add requireApiLogin and requireApiRole('admin') to these routes by uncommenting them
userAdminRouter.get('/api/users', /* requireApiLogin, */ getUsers);
userAdminRouter.put('/api/users/:id', /* requireApiLogin, */ updateUser);
userAdminRouter.delete('/api/users/:id', /* requireApiLogin, */ deleteUser);

export default userAdminRouter;