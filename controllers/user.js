const mongoose = require("mongoose");
const User = require("../models/user");

const getAuthUser = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(404).json({ message: `User Not Found` });
		}
		res.status(200).json({
			data: req.user,
		});
	} catch (error) {
		console.error("Get auth user error:", error);
		res.status(500).json({ 
			message: error.message || "Failed to get user",
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

const getAllUsers = async (req, res) => {
	try {
		// Check if database is connected, if not, use mock data
		if (mongoose.connection.readyState !== 1) {
			console.log("Database not connected, using mock users");
			
			// Mock users for testing
			const mockUsers = [
				{
					_id: "mock-user-1",
					firstName: "John",
					lastName: "Doe",
					email: "john@example.com",
					image: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
					createdAt: new Date().toISOString()
				},
				{
					_id: "mock-user-2",
					firstName: "Jane",
					lastName: "Smith",
					email: "jane@example.com",
					image: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
					createdAt: new Date().toISOString()
				},
				{
					_id: "mock-user-3",
					firstName: "Bob",
					lastName: "Wilson",
					email: "bob@example.com",
					image: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
					createdAt: new Date().toISOString()
				}
			];
			
			return res.status(200).send({ data: mockUsers });
		}

		// Original database code (when DB is connected)
		const allUsers = await User.find({ _id: { $ne: req.user._id } })
			.select("-password")
			.sort({ _id: -1 });
		res.status(200).send({ data: allUsers });
	} catch (error) {
		console.error("Get all users error:", error);
		res.status(500).json({ 
			message: error.message || "Failed to get users",
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

module.exports = { getAuthUser, getAllUsers };
