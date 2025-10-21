// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // NEW: For handling cookies
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// --- Models ---
const User = require('./models/User.js');
const Todo = require('./models/Todo.js'); // Assuming you update Todo model later

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
// IMPORTANT: Use the same JWT_SECRET variable in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key'; 

// --- CORS Configuration (Crucial for Deployment) ---
const corsOptions = {
    // This is your live frontend URL
    origin: "https://todo-frontend-app-bqpl.onrender.com", 
    credentials: true, // Allow cookies (tokens) to be sent/received
};

// --- Middleware ---
app.use(express.json());
app.use(cookieParser()); // NEW: Use cookie parser
app.use(cors(corsOptions));

// --- Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// Middleware to protect routes (checks for JWT in cookie)
const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // For unauthenticated users, we return a 401
        return res.status(401).json({ message: 'Not authorized, please log in.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload (user ID) to the request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed.' });
    }
};


// --- Authentication Routes ---

// @route POST /register
// @desc Register new user (Uses the logic you previously had)
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
// @desc Authenticate user & set token in cookie (THIS WAS THE MISSING ROUTE)
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
            secure: true, // MUST be true for Render (HTTPS)
            sameSite: 'none', // MUST be 'none' for cross-site cookie
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


// @route GET /logout
// @desc Clear cookie to log user out
app.get('/logout', (req, res) => {
    res.clearCookie('token', { 
        httpOnly: true,
        secure: true, 
        sameSite: 'none'
    });
    res.json({ message: 'Logged out successfully' });
});


// --- Todo Routes (Now Protected) ---
// Note: We are using protect middleware to secure all Todo routes

// Get all todos
app.get("/todos", protect, async (req, res) => {
  try {
    // IMPORTANT: In a real app, you would filter by req.user.id
    // For now, we'll keep the simple find() for demonstration:
    const todos = await Todo.find(); 
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new todo
app.post("/todos", protect, async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
      completed: false
      // In a real app: user: req.user.id
    });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a todo (mark complete/incomplete)
app.put("/todos/:id", protect, async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    // In a real app, ensure req.user.id owns this todo before updating
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a todo
app.delete("/todos/:id", protect, async (req, res) => {
  try {
    // In a real app, ensure req.user.id owns this todo before deleting
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});