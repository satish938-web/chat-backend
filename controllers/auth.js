const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

const registerUser = async (req, res, next) => {
	try {
		// Check if database is connected
		if (mongoose.connection.readyState !== 1) {
			return res.status(500).json({ message: "Database not connected. Please try again later." });
		}

		let { firstName, lastName, email, password } = req.body;
		const existingUser = await User.findOne({ email: email });
		if (existingUser) {
			return res.status(400).json({ message: `User Already Exist` });
		}
		password = bcrypt.hashSync(password, 8);
		const userData = new User({
			firstName,
			lastName,
			email,
			password,
		});
		const user = await userData.save();
		const jwt = generateToken(user._id);
		res.status(200).json({
			message: "Registration Successfully",
			token: jwt,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ 
			message: error.message || "Registration failed",
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

const loginUser = async (req, res) => {
	let { email, password } = req.body;
	let user = await User.findOne({ email: email });
	if (!user) {
		return res.status(404).json({ message: `User Not Found` });
	}
	const isPasswordValid = bcrypt.compareSync(password, user.password);
	if (!isPasswordValid) {
		return res.status(401).json({ message: "Invalid Password" });
	}
	const jwt = generateToken(user._id);
	user.password = null;
	res.status(200).json({
		message: "Login Successfully",
		data: user,
		token: jwt,
	});
};

module.exports = { registerUser, loginUser };
