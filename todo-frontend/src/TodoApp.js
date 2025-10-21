import React, { useState, useEffect } from "react";
// Import useNavigate if you were using React Router, but for now we rely on the prop
// import { useNavigate } from 'react-router-dom'; 

import "./TodoApp.css";

const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

// 1. Accept the onLogout function passed from App.js
function TodoApp({ onLogout }) { 
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch todos and include credentials
  const fetchTodos = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/todos`, {
        method: "GET",
        // CRITICAL FIX: Include the authentication cookie in the request
        credentials: 'include' 
      });

      if (response.status === 401) {
        // 3. If 401, call the logout function to reset state and send user to login
        console.error("Authentication failed (401). Logging out user.");
        onLogout(); // Log out and switch to login view
        return; 
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data);

    } catch (err) {
      console.error("Error fetching todos:", err);
      // Set an error state to display a message instead of crashing
      setError("Failed to load todos. You may need to log in again."); 
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchTodos();
  }, []); // Empty dependency array means this runs only once on mount


  // Helper function for all authenticated fetches
  const authenticatedFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // Ensure cookies are sent for all requests
        headers: { 
            'Content-Type': 'application/json',
            ...options.headers 
        },
        ...options // Allows specific options to override defaults
    };

    const response = await fetch(url, defaultOptions);
    
    // Check for 401 on every authenticated request
    if (response.status === 401) {
        console.error("Authentication failed during CRUD operation (401). Logging out user.");
        onLogout(); // Log out and switch to login view
        // Throwing here stops further processing of the request
        throw new Error("Unauthorized"); 
    }

    return response;
  }

  // --- CRUD Functions (Modified to use authenticatedFetch) ---

  const addTodo = async () => {
    if (!text) return;
    const todoText = text;
    setText(""); // Clear input immediately
    
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/todos`, {
        method: "POST",
        body: JSON.stringify({ text: todoText })
      });
      
      if (!response.ok) throw new Error("Failed to add todo.");
      
      const newTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    
    } catch (err) {
      console.error("Error adding todo:", err);
      // Only set error message if the error wasn't an "Unauthorized" logout trigger
      if (err.message !== "Unauthorized") {
          setError("Could not add todo.");
          setText(todoText); // Restore text if save failed
      }
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !completed }) // Toggle the value
      });

      if (!response.ok) throw new Error("Failed to toggle todo.");

      const updatedTodo = await response.json();
      setTodos(todos.map(t => (t._id === id ? updatedTodo : t)));

    } catch (err) {
      console.error("Error toggling todo:", err);
       if (err.message !== "Unauthorized") {
           setError("Could not update todo status.");
       }
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/todos/${id}`, { 
        method: "DELETE" 
      });

      if (!response.ok) throw new Error("Failed to delete todo.");

      setTodos(todos.filter(t => t._id !== id));
      
    } catch (err) {
      console.error("Error deleting todo:", err);
       if (err.message !== "Unauthorized") {
           setError("Could not delete todo.");
       }
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="app">
        <div className="todo-container">
          <h1>🌟 My Todo List</h1>
          <p>Loading your list...</p>
        </div>
      </div>
    );
  }

  // If error is present, we show the error message.
  if (error) {
    return (
      <div className="app">
        <div className="todo-container">
          <h1>🌟 My Todo List</h1>
          <p style={{ color: 'red' }}>Error: {error}</p>
          <button onClick={fetchTodos} className="mt-4">Try Again</button>
          <button onClick={onLogout} style={{ marginTop: '10px' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="todo-container">
        <h1>🌟 My Todo List</h1>

        {/* 2. ADD LOGOUT BUTTON */}
        <button 
            onClick={onLogout} 
            style={{ position: 'absolute', top: '10px', right: '10px', padding: '8px 15px', borderRadius: '5px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
        >
            Log Out
        </button> 
        {/* END LOGOUT BUTTON */}

        <div className="input-section">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter a new todo"
          />
          <button onClick={addTodo}>➕ Add</button>
        </div>

        <ul>
          {todos.map(todo => (
            <li key={todo._id} className={todo.completed ? "completed" : ""}>
              <span>{todo.text}</span>
              <div className="actions">
                <button onClick={() => toggleComplete(todo._id, todo.completed)}>
                  {todo.completed ? "↩ Undo" : "✔ Done"}
                </button>
                <button className="delete" onClick={() => deleteTodo(todo._id)}>
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoApp;
