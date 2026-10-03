import { User } from '../models/schemas/users.js';

export const getUsers = async (req, res) => {
    try {
        let users;
        
        // If the user is an admin, find everyone. 
        // If they are a standard customer, find only their specific document.
        if (req.user.role === 'admin') {
            users = await User.find().populate('role');
        } else {
            users = await User.find({ _id: req.user.id }).populate('role');
        }
        
        // Format the data so it works cleanly with your EJS frontend
        const formattedUsers = users.map(u => ({
            _id: u._id,
            displayName: u.displayName,
            email: u.email,
            role: u.role.name 
        }));

        return res.status(200).json(formattedUsers);
    } catch (error) {
        return res.status(500).json({ message: "Server error fetching users" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { displayName, email } = req.body; 
        
        // For Security check: If a non-admin tries to update an ID that isn't theirs, block it.
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ message: "You can only update your own account." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { displayName, email }, 
            { new: true }
        );
        
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: "Error updating user" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // The router already checks if they are an admin, so I can safely delete here.

        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user" });
    }
};