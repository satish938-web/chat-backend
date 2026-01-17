const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// COMPLETELY PERMISSIVE CORS - NO RESTRICTIONS
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Credentials", "false");
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.use(cors({
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err, req, res, next) => {
	console.error('Server Error:', err);
	res.status(500).json({ 
		message: err.message || "Internal Server Error",
		error: process.env.NODE_ENV === 'development' ? err.stack : undefined
	});
});

// All routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");

// Connect to Database
main()
	.then(() => console.log("Database Connection established"))
	.catch((err) => console.log(err));

async function main() {
	const mongoUri = process.env.MONGODB_URI || "mongodb+srv://satish1:L8j6rRGCcZhED8HZ@cluster0.uwpa6ac.mongodb.net/chat-app?retryWrites=true&w=majority";
	
	if (!process.env.MONGODB_URI) {
		console.warn("MONGODB_URI not defined, using fallback");
	}
	
	try {
		const options = {
			serverSelectionTimeoutMS: 15000, // Timeout after 15s
			socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
			bufferMaxEntries: 0, // Disable mongoose buffering
			bufferCommands: false, // Disable mongoose buffering
			maxPoolSize: 10, // Maintain up to 10 socket connections
			serverApi: {
				version: '1',
				strict: true,
				deprecationErrors: true
			}
		};
		
		console.log("Attempting to connect to MongoDB...");
		await mongoose.connect(mongoUri, options);
		console.log("Database Connection established");
		
		// Test the connection
		const User = require("./models/user");
		const userCount = await User.countDocuments();
		console.log(`Found ${userCount} users in database`);
		
	} catch (error) {
		console.error("Database connection failed:", error.message);
		// Don't exit the app, let it run without DB for now
		console.log("Server will continue without database...");
	}
}

// Root route
app.get("/", (req, res) => {
	res.json({
		message: "Welcome to Chat Application!",
		frontend_url: process.env.FRONTEND_URL,
		status: "Server is running",
		timestamp: new Date().toISOString(),
		env_vars: {
			MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT SET",
			JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
			FRONTEND_URL: process.env.FRONTEND_URL || "NOT SET"
		}
	});
});

// Test endpoint
app.get("/test", (req, res) => {
	res.json({
		message: "Test endpoint working!",
		timestamp: new Date().toISOString(),
		server_status: "OK",
		db_connected: mongoose.connection.readyState === 1,
		db_state: mongoose.connection.readyState
	});
});

// Test signup endpoint (no database)
app.post("/test-signup", (req, res) => {
	res.json({
		message: "Test signup working!",
		data: req.body,
		token: "test-token-123"
	});
});

// Working signup endpoint (bypass database for testing)
app.post("/api/auth/signup-test", (req, res) => {
	const { firstName, lastName, email, password } = req.body;
	
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
	const jwt = require("jsonwebtoken");
	const token = jwt.sign({ userId: mockUser._id }, "fallback-secret-key-for-production-2024", { expiresIn: "48h" });
	
	res.status(200).json({
		message: "Registration Successfully",
		token: token,
		data: mockUser
	});
});

// Add request debugging middleware
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
	next();
});

// Simple status endpoint (placed early to ensure it works)
app.get("/status", (req, res) => {
	res.json({
		message: "Server is running!",
		timestamp: new Date().toISOString(),
		db_connected: mongoose.connection.readyState === 1,
		db_state: mongoose.connection.readyState,
		path: req.path
	});
});

// Database status endpoint (must be before invalid routes)
app.get("/db-status", async (req, res) => {
	try {
		console.log("DB Status endpoint called");
		const User = require("./models/user");
		const userCount = await User.countDocuments();
		console.log(`Found ${userCount} users`);
		res.json({
			db_connected: mongoose.connection.readyState === 1,
			db_state: mongoose.connection.readyState,
			user_count: userCount,
			message: userCount > 0 ? `Found ${userCount} users in database` : "No users found"
		});
	} catch (error) {
		console.error("DB Status error:", error);
		res.json({
			db_connected: false,
			db_state: mongoose.connection.readyState,
			user_count: 0,
			error: error.message
		});
	}
});

// All routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// Invalid routes
app.all("*", (req, res) => {
	res.json({ error: "Invalid Route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	const errorMessage = err.message || "Something Went Wrong!";
	res.status(500).json({ message: errorMessage });
});

// Start the server
const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, async () => {
	console.log(`Server listening on ${PORT}`);
});

// Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
	pingTimeout: 60000,
	transports: ["websocket"],
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		credentials: false
	}
});

// Socket connection
io.on("connection", (socket) => {
	console.log("Connected to socket.io:", socket.id);

	// Join user and message send to client
	const setupHandler = (userId) => {
		if (!socket.hasJoined) {
			socket.join(userId);
			socket.hasJoined = true;
			console.log("User joined:", userId);
			socket.emit("connected");
		}
	};
	const newMessageHandler = (newMessageReceived) => {
		let chat = newMessageReceived?.chat;
		chat?.users.forEach((user) => {
			if (user._id === newMessageReceived.sender._id) return;
			console.log("Message received by:", user._id);
			socket.in(user._id).emit("message received", newMessageReceived);
		});
	};

	// Join a Chat Room and Typing effect
	const joinChatHandler = (room) => {
		if (socket.currentRoom) {
			if (socket.currentRoom === room) {
				console.log(`User already in Room: ${room}`);
				return;
			}
			socket.leave(socket.currentRoom);
			console.log(`User left Room: ${socket.currentRoom}`);
		}
		socket.join(room);
		socket.currentRoom = room;
		console.log("User joined Room:", room);
	};
	const typingHandler = (room) => {
		socket.in(room).emit("typing");
	};
	const stopTypingHandler = (room) => {
		socket.in(room).emit("stop typing");
	};

	// Clear, Delete and Create chat handlers
	const clearChatHandler = (chatId) => {
		socket.in(chatId).emit("clear chat", chatId);
	};
	const deleteChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			console.log("Chat delete:", user._id);
			socket.in(user._id).emit("delete chat", chat._id);
		});
	};
	const chatCreateChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			console.log("Create chat:", user._id);
			socket.in(user._id).emit("chat created", chat);
		});
	};

	socket.on("setup", setupHandler);
	socket.on("new message", newMessageHandler);
	socket.on("join chat", joinChatHandler);
	socket.on("typing", typingHandler);
	socket.on("stop typing", stopTypingHandler);
	socket.on("clear chat", clearChatHandler);
	socket.on("delete chat", deleteChatHandler);
	socket.on("chat created", chatCreateChatHandler);

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
		socket.off("setup", setupHandler);
		socket.off("new message", newMessageHandler);
		socket.off("join chat", joinChatHandler);
		socket.off("typing", typingHandler);
		socket.off("stop typing", stopTypingHandler);
		socket.off("clear chat", clearChatHandler);
		socket.off("delete chat", deleteChatHandler);
		socket.off("chat created", chatCreateChatHandler);
	});
});
