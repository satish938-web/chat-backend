const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

const registerUser = async (req, res, next) => {
	try {
		// Check if database is connected, if not, use mock data
		if (mongoose.connection.readyState !== 1) {
			console.log("Database not connected, using mock registration");
			
			let { firstName, lastName, email, password } = req.body;
			
			// Basic validation
			if (!firstName || !lastName || !email || !password) {
				return res.status(400).json({ message: "All fields are required" });
			}
			
			// Mock user creation
			const mockUser = {
				_id: "mock-user-id-" + Date.now(),
				firstName,
				lastName,
				email,
				password: "hashed-password"
			};
			
			// Generate token
			const jwt = generateToken(mockUser._id);
			
			return res.status(200).json({
				message: "Registration Successfully",
				token: jwt,
				data: mockUser
			});
		}

		// Original database code (when DB is connected)
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
	try {
		let { email, password } = req.body;
		
		// Check if database is connected, if not, use mock data
		if (mongoose.connection.readyState !== 1) {
			console.log("Database not connected, using mock login");
			
			// Basic validation
			if (!email || !password) {
				return res.status(400).json({ message: "Email and password are required" });
			}
			
			// Mock user login (accept any credentials for testing)
			const mockUser = {
				_id: "mock-user-id-" + Date.now(),
				firstName: "Test",
				lastName: "User",
				email: email,
				password: null // Don't send password back
			};
			
			// Generate token
			const jwt = generateToken(mockUser._id);
			
			return res.status(200).json({
				message: "Login Successfully",
				data: mockUser,
				token: jwt,
			});
		}

		// Original database code (when DB is connected)
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
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ 
			message: error.message || "Login failed",
			error: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

module.exports = { registerUser, loginUser };
