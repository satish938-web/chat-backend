const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-production-2024";

if (!process.env.JWT_SECRET) {
	console.warn("JWT_SECRET not defined, using fallback for production");
}

const generateToken = (userId) => {
	const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "48h" });
	return token;
};
const getUserIdFromToken = (token) => {
	const decodedToken = jwt.verify(token, JWT_SECRET);
	return decodedToken.userId;
};

module.exports = {
	generateToken,
	getUserIdFromToken,
};
