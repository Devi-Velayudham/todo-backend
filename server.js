const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require('bcrypt');
require("dotenv").config();

const Todo = require("./models/Todo.js");
const User = require('./models/User.js'); // Import the new User model

const app = express();

// Middleware
//app.use(cors());
app.use(express.json());

const corsOptions = {
    origin: "https://todo-frontend-app-bqpl.onrender.com", // React app
    credentials: true,
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Import Todo model





// Routes

// Register a new user
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User with that email already exists" });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create and save the new user
        user = new User({
            email,
            password: hashedPassword
        });
        await user.save();

        // Send a success message (you will send a token here later, but for now, just confirm)
        res.status(201).json({ message: "User registered successfully!" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new todo
app.post("/todos", async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
      completed: false
    });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a todo (mark complete/incomplete)
app.put("/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
