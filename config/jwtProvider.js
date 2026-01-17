const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
	console.error("JWT_SECRET is not defined in environment variables");
	process.exit(1);
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
