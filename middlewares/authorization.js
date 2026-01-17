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
		if (userId) {
			req.user = await User.findById(userId).select("-password");
			if (!req.user) {
				return res.status(404).send({ message: "User not found" });
			}
		}
		next();
	} catch (error) {
		return res.status(401).send({ message: "Invalid token" });
	}
});

module.exports = { authorization };
