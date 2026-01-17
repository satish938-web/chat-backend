const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

const registerUser = async (req, res, next) => {
	try {
		// Only use real database - no mock registration
		let { firstName, lastName, email, password } = req.body;
		
		// Basic validation
		if (!firstName || !lastName || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		
		// Check if user already exists
		const existingUser = await User.findOne({ email: email });
		if (existingUser) {
			return res.status(400).json({ message: `User Already Exist` });
		}
		
		// Hash password and create user
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
	try {
		let { email, password } = req.body;
		
		// Basic validation
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}
		
		// Find user in database
		let user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).json({ message: `User Not Found` });
		}
		
		// Check password
		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid Password" });
		}
		
		// Generate token and return user data
		const jwt = generateToken(user._id);
		user.password = null;
		
		res.status(200).json({
			message: "Login Successfully",
			data: user,
			token: jwt,
		});
		
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ 
			message: error.message || "Login failed",
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

module.exports = { registerUser, loginUser };
