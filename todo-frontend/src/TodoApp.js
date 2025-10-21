import React, { useState, useEffect } from "react";
import "./TodoApp.css";

const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

function TodoApp({ onLogout }) { 
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function for all authenticated fetches (Updated for correct header merging)
  const authenticatedFetch = async (url, options = {}) => {
    // 1. Define default headers and credentials
    const defaultHeaders = { 
        'Content-Type': 'application/json',
    };

    // 2. Merge user-provided options with defaults, ensuring credentials and method are prioritized
    const fetchOptions = {
        // Always include credentials for secure cookie transfer
        credentials: 'include', 
        
        // Merge default headers with any custom headers passed in options
        headers: { 
            ...defaultHeaders,
            ...options.headers 
        },
        
        // Spread remaining options (like method, body, etc.)
        ...options 
    };
    // We must delete the inner 'headers' from the spread options so it doesn't
    // override the full headers object we just created.
    delete fetchOptions.headers; 


    const response = await fetch(url, { ...fetchOptions, headers: fetchOptions.headers });
    
    // Check for 401 on every authenticated request
    if (response.status === 401) {
        console.error("Authentication failed during CRUD operation (401). Logging out user.");
        onLogout(); 
        throw new Error("Unauthorized"); 
    }

    return response;
  }
    
  // Function to fetch todos and include credentials
  const fetchTodos = async () => {
    setError(null);
    setLoading(true);
    try {
      // Use the authenticatedFetch for GET request
      const response = await authenticatedFetch(`${BACKEND_URL}/todos`, {
        method: "GET",
        // Note: We don't need to specify credentials or headers here, 
        // as authenticatedFetch handles it.
      });

      // The 401 check is now inside authenticatedFetch, so we check for the response status.
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data);

    } catch (err) {
      console.error("Error fetching todos:", err);
      // Check if the error was the "Unauthorized" thrown by authenticatedFetch
      if (err.message !== "Unauthorized") {
          // If it wasn't a log out, then display the error
          setError("Failed to load todos. You may need to log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchTodos();
  }, []); 


  // --- CRUD Functions ---

  const addTodo = async () => {
    if (!text) return;
    const todoText = text;
    setText(""); // Clear input immediately
    
    try {
      // Uses authenticatedFetch which correctly includes credentials and Content-Type
      const response = await authenticatedFetch(`${BACKEND_URL}/todos`, {
        method: "POST",
        body: JSON.stringify({ text: todoText })
      });
      
      if (!response.ok) throw new Error("Failed to add todo.");
      
      const newTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    
    } catch (err) {
      console.error("Error adding todo:", err);
      if (err.message !== "Unauthorized") {
          setError("Could not add todo.");
          setText(todoText); // Restore text if save failed
      }
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      // Uses authenticatedFetch which correctly includes credentials and Content-Type
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
      // Uses authenticatedFetch which correctly includes credentials and Content-Type
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

        <button 
            onClick={onLogout} 
            style={{ position: 'absolute', top: '10px', right: '10px', padding: '8px 15px', borderRadius: '5px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
        >
            Log Out
        </button> 

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
