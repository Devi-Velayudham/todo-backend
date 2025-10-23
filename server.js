// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// --- Models ---
// NOTE: Ensure User.js and Todo.js paths are correct for your local setup
const User = require('./models/User.js');
const Todo = require('./models/Todo.js');

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
// Use the secret from environment variables which you set on Render!
const JWT_SECRET = process.env.JWT_SECRET; 

// --- CORS Configuration (Crucial for Deployment) ---
const corsOptions = {
    origin: ["https://todo-frontend-app-bqpl.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));


// --- Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// Middleware to protect routes (checks for JWT in cookie)
const protect = (req, res, next) => {
    // We expect the token to be stored in a cookie named 'token'
    const token = req.cookies.token;

    if (!token) {
        // If no token is present, respond with 401
        return res.status(401).json({ message: 'Not authorized, please log in.' });
    }

    try {
        // Verify token using the secret from Render environment variables
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach the user ID to the request object
        req.user = decoded; 
        next();
    } catch (error) {
        // If verification fails (e.g., wrong secret, token expired), respond with 401
        res.status(401).json({ message: 'Not authorized, token failed.' });
    }
};


// --- Authentication Routes ---

// @route POST /register
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'Registration successful. Please log in.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
});

// @route POST /login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { id: user._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            // CRITICAL FIX: REMOVED domain: '.onrender.com' 
            maxAge: 3600000 // 1 hour
        });

        res.json({ 
            message: 'Login successful',
            user: { id: user._id, email: user.email } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
});


// @route POST /logout
app.post('/logout', (req, res) => {
    // 1. Clear the authentication cookie.
    res.clearCookie('token', { 
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        // CRITICAL FIX: REMOVED domain: '.onrender.com' 
    });

    // 2. Add headers to explicitly prevent the browser and proxies from caching this response
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 3. Send a successful response
    res.status(200).json({ message: "Logged out successfully." });
});


// --- Todo Routes (User-Aware) ---

// Get all todos for the logged-in user
app.get("/todos", protect, async (req, res) => {
    try {
        // Filter todos by the logged-in user's ID (req.user.id)
        const todos = await Todo.find({ user: req.user.id }).sort({ date: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new todo for the logged-in user
app.post("/todos", protect, async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text,
            completed: false,
            // Assign the user ID from the token payload
            user: req.user.id 
        });
        const savedTodo = await newTodo.save();
        res.json(savedTodo);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: "Failed to create todo. Check text or model fields." });
    }
});

// Update a todo (mark complete/incomplete)
app.put("/todos/:id", protect, async (req, res) => {
    try {
        // SECURITY FIX: Ensure the user owns this todo before updating
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, // Find by ID AND User ID
            { completed: req.body.completed },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found or does not belong to user." });
        }

        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a todo
app.delete("/todos/:id", protect, async (req, res) => {
    try {
        // SECURITY FIX: Ensure the user owns this todo before deleting
        const result = await Todo.deleteOne({ _id: req.params.id, user: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Todo not found or does not belong to user." });
        }

        res.json({ message: "Todo deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});