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
		// Only use real database users - no mock data
		console.log("Getting all users from database");
		
		const allUsers = await User.find({ _id: { $ne: req.user._id } })
			.select("-password")
			.sort({ _id: -1 });
		
		console.log(`Found ${allUsers.length} real users in database`);
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
