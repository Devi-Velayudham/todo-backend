import React, { useState, useEffect } from "react";
import "./TodoApp.css"; // Assuming you have a CSS file for styling

// Define the backend URL once (Ensure this matches App.js)
const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

// Helper function to handle fetch requests with credentials
const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    // CRITICAL: Tells the browser to send the HTTP-only cookie
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};


function TodoApp({ onLogout }) {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetching Logic ---
  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the helper fetch function
      const response = await fetchWithCredentials(`${BACKEND_URL}/todos`, {
        method: 'GET'
      });
      
      if (response.status === 401) {
          // If a 401 is received here, the session expired or is invalid
          // Call the external logout handler to clear state and redirect
          onLogout();
          return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch todos.");
      }

      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Could not load todos. Please try logging out and back in.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // --- CRUD Operations ---

  const addTodo = async (e) => {
    e.preventDefault();
    if (!todoText.trim()) return;

    setError(null);
    try {
      // FIX: Use fetchWithCredentials instead of the undefined 'authenticatedFetch'
      const response = await fetchWithCredentials(`${BACKEND_URL}/todos`, {
        method: "POST",
        body: JSON.stringify({ text: todoText.trim() }),
      });

      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) throw new Error("Failed to add todo.");

      const newTodo = await response.json();
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setTodoText("");
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Could not add todo.");
    }
  };

  const toggleComplete = async (id, completed) => {
    setError(null);
    try {
      // FIX: Use fetchWithCredentials instead of the undefined 'authenticatedFetch'
      const response = await fetchWithCredentials(`${BACKEND_URL}/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !completed }), // Toggle the value
      });
      
      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) throw new Error("Failed to update todo.");

      const updatedTodo = await response.json();
      setTodos((prevTodos) => 
        prevTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error("Error toggling todo:", err);
      setError("Could not update todo status.");
    }
  };

  const deleteTodo = async (id) => {
    setError(null);
    try {
      // FIX: Use fetchWithCredentials instead of the undefined 'authenticatedFetch'
      const response = await fetchWithCredentials(`${BACKEND_URL}/todos/${id}`, {
        method: "DELETE",
      });
      
      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) throw new Error("Failed to delete todo.");

      // Remove the todo from the local state
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Could not delete todo.");
    }
  };


  // --- Render Logic ---
  if (loading) return <div className="todo-container">Loading Todos...</div>;
  

  return (
    <div className="todo-container">
      <div className="header">
        <h1>My To-Do List</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      <form onSubmit={addTodo} className="input-form">
        <input
          type="text"
          placeholder="Add a new task..."
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      
      {error && <p className="error-message">{error}</p>}

      <div className="todo-list">
        {todos.length === 0 && !loading && <p className="empty-message">You have no tasks! Time to relax or add a new one.</p>}
        {todos.map((todo) => (
          <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <span 
                className="todo-text" 
                onClick={() => toggleComplete(todo._id, todo.completed)}
            >
                {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo._id)} className="delete-button">
              &#x2715; 
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoApp;
