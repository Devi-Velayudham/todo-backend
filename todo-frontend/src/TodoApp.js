import React, { useState, useEffect } from "react";
// You will need to import your routing hook (e.g., useNavigate, if you're using React Router)
// import { useNavigate } from 'react-router-dom'; 

import "./TodoApp.css";

const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If you have a routing hook, you might use it here to redirect on error
  // const navigate = useNavigate(); 

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
        // If 401, the token is bad or expired. Log the user out and redirect.
        console.error("Authentication failed. Redirecting to login.");
        // **If using React Router, uncomment the line below**
        // navigate('/login'); 
        // For now, we will just stop loading:
        setLoading(false);
        // We stop here so the code doesn't try to parse the error body as JSON.
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
    return fetch(url, {
      ...options,
      credentials: 'include', // Ensure cookies are sent for all requests
      headers: { 
        'Content-Type': 'application/json',
        ...options.headers 
      }
    });
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
      setError("Could not add todo.");
      setText(todoText); // Restore text if save failed
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
      setError("Could not update todo status.");
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
      setError("Could not delete todo.");
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

  if (error) {
    return (
      <div className="app">
        <div className="todo-container">
          <h1>🌟 My Todo List</h1>
          <p style={{ color: 'red' }}>Error: {error}</p>
          <button onClick={fetchTodos} className="mt-4">Try Again</button>
          {/* Add a logout button here too, in a real app */}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="todo-container">
        <h1>🌟 My Todo List</h1>

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
            // CRITICAL: Ensure you are using 'completed' field correctly if your model has it, 
            // otherwise use 'done' (based on the previous backend code). Assuming 'completed' for now.
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