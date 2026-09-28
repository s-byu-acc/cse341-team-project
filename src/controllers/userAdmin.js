// MOCK DATA: I'm using this to test frontend locally.
// I will delete this array When Feature-1 is merged,& import the Mongoose User model:
// The methods attached find, findByIdAndUpdate, findByIdAndDelete are built-in Mongoose functions
// that handle the heavy lifting of searching, modifying, and removing data directly in the MongoDB database.

// import User from '../models/user.js';
let mockUsers = [
    { _id: "1", displayName: "Damilola Admin", email: "admin@kizunarail.com", role: "admin" },
    { _id: "2", displayName: "Test Passenger1", email: "passenger1@test.com", role: "standard" },
    { _id: "3", displayName: "Test Passenger2", email: "passenger2@test.com", role: "standard" },
    { _id: "4", displayName: "Test Passenger2", email: "passenger2@test.com", role: "standard" }
];

export const getUsers = async (req, res) => {
    try {
        // FUTURE MONGOOSE CALL: const users = await User.find();
        return res.status(200).json(mockUsers);
    } catch (error) {
        return res.status(500).json({ message: "Server error fetching users" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { displayName, email, role } = req.body;
        
        // FUTURE MONGOOSE CALL: 
        // const updatedUser = await User.findByIdAndUpdate(id, { displayName, email, role }, { new: true });
        
        // MOCK LOGIC:
        const userIndex = mockUsers.findIndex(u => u._id === id);
        if (userIndex === -1) return res.status(404).json({ message: "User not found" });
        
        mockUsers[userIndex] = { ...mockUsers[userIndex], displayName, email, role };
        return res.status(200).json(mockUsers[userIndex]);
    } catch (error) {
        return res.status(500).json({ message: "Error updating user" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // FUTURE MONGOOSE CALL: await User.findByIdAndDelete(id);
        
        // MOCK LOGIC:
        mockUsers = mockUsers.filter(u => u._id !== id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user" });
    }
};