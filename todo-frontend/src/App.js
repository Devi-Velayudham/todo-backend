import React, { useState, useEffect } from "react";
// Assuming you have these components in your project structure
import Login from "./Login";
import TodoApp from "./TodoApp";
import Register from "./Register";
import "./App.css"; // Assuming shared styling

// Define the backend URL once
const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

function App() {
  // State to track the actual login status based on the server session
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to manage the current view (login, register, or todo app)
  const [view, setView] = useState("login"); 
  // State to manage initial loading while checking the session
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if the session cookie is valid
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
        // Attempt to access a protected resource. 
        // credentials: 'include' ensures the browser sends any existing session cookie.
        const response = await fetch(`${BACKEND_URL}/todos`, {
            method: 'GET',
            credentials: 'include'
        });

        // If the server returns 200, the cookie is valid and we are logged in
        if (response.ok) {
            setIsLoggedIn(true);
            setView('todo');
        } else {
            // If it returns 401, the cookie is invalid or missing
            setIsLoggedIn(false);
            setView('login');
        }
    } catch (error) {
        console.error("Error checking auth status (Network/CORS likely):", error);
        setIsLoggedIn(false);
        setView('login');
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status once when the app mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function called by Login.js upon successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView("todo");
  };

  // Function called by TodoApp.js when the user clicks Logout or receives a 401 error
  const handleLogout = async () => {
    // Clear client state immediately for a fast UI update
    setIsLoggedIn(false);
    setView("login");
    
    try {
        // Send request to backend to clear the session cookie
        await fetch(`${BACKEND_URL}/logout`, { 
            method: 'POST', 
            // CRITICAL: Send the cookie so the server knows which session to destroy
            credentials: 'include' 
        });
        console.log("Logout successful on server.");
        
    } catch (error) {
        console.error("Logout request failed (Server/Network issue):", error);
        // Client state is already cleared, so the user is logged out in the UI
    } 
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-screen">Checking session status...</div>;
    }
    
    // If we are logged in, show the TodoApp, passing the logout handler
    if (isLoggedIn) {
      return <TodoApp onLogout={handleLogout} />;
    }

    // If not logged in, show either the Login or Register view
    switch (view) {
      case "register":
        return (
          <Register onSwitchToLogin={() => setView("login")} />
        );
      case "login":
      default:
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={() => setView("register")}
          />
        );
    }
  };

  return <div className="app-container">{renderContent()}</div>;
}

export default App;
