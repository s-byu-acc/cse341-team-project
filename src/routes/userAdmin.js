//This file to define my endpoints and place the commented-out Feature 1 hooks.
import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userAdmin.js';
import { requireApiLogin, requirePageLogin, requireApiRole } from '../middleware/auth.js';

const userAdminRouter = Router();

// --- PAGE ROUTE ---
userAdminRouter.get('/admin/users', requirePageLogin(), (req, res) => {
    res.render('users', { title: 'User Administration' });
});

// --- API ROUTES ---
// requireApiLogin() returns a JSON error if the user is not logged in
userAdminRouter.get('/api/users', requireApiLogin(), getUsers);
userAdminRouter.put('/api/users/:id', requireApiLogin(), updateUser);

// requireApiRole('admin') ensures only admins can access the delete endpoint
userAdminRouter.delete('/api/users/:id', requireApiLogin(), requireApiRole('admin'), deleteUser);

export default userAdminRouter;