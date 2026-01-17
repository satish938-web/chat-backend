const mongoose = require("mongoose");
const { getUserIdFromToken } = require("../config/jwtProvider");
const User = require("../models/user");
const wrapAsync = require("./wrapAsync");

const authorization = wrapAsync(async (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(404).send({ message: "Token not found" });
	}
	try {
		const userId = getUserIdFromToken(token);
		console.log("Token userId:", userId);
		
		// Reject mock user IDs
		if (userId && (userId.toString().startsWith("mock-user-id") || userId.toString().startsWith("test-token"))) {
			console.log("Rejecting mock token:", userId);
			return res.status(401).send({ message: "Invalid token - please login again" });
		}
		
		if (userId) {
			// Always use real database users - no mock data
			req.user = await User.findById(userId).select("-password");
			console.log("Found user from database:", req.user ? req.user.email : "User not found");
			
			if (!req.user) {
				return res.status(404).send({ message: "User not found" });
			}
		}
		next();
	} catch (error) {
		console.error("Authorization error:", error.message);
		return res.status(401).send({ message: "Invalid token" });
	}
});

module.exports = { authorization };
