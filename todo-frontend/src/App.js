import React, { useState, useEffect } from "react";
// Assuming you have these components in your project structure
import Login from "./Login";
import TodoApp from "./TodoApp";
import Register from "./Register";
import "./App.css"; // Assuming shared styling
// CRITICAL CHANGE 1: Import the central BACKEND_URL AND the helper function
import { BACKEND_URL, fetchWithCredentials } from "./api"; // <--- ADDED fetchWithCredentials

// CRITICAL CHANGE 2: Removed the local BACKEND_URL definition

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
        // CRITICAL CHANGE: Use the imported helper for better error handling and consistency
        // Note: The helper will automatically include credentials and handle the URL base.
        const response = await fetchWithCredentials(`${BACKEND_URL}/todos`, { 
            method: 'GET' 
        });

        // The helper function should throw an error on 401/403, 
        // so if we reach this point, the fetch was successful.
        if (response.ok) {
            setIsLoggedIn(true);
            setView('todo');
        } else {
            // Fallback for unexpected non-401 non-error response
            setIsLoggedIn(false);
            setView('login');
        }
    } catch (error) {
        // If fetchWithCredentials throws an error (like for a 401), 
        // we catch it here and treat it as unauthorized.
        console.error("Error checking auth status (Unauthorized likely):", error);
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
        // Use the helper for consistency, although a regular fetch with credentials works fine for logout
        await fetchWithCredentials(`${BACKEND_URL}/logout`, { 
            method: 'POST', 
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
      // We also pass the checkAuthStatus function to TodoApp
      // so it can re-run the check if an action fails (e.g., 401 during a todo action)
      return <TodoApp onLogout={handleLogout} checkAuthStatus={checkAuthStatus} />;
    }

    // If not logged in, show either the Login or Register view
    switch (view) {
      case "register":
        // Note: The Register component will handle its own success action
        return (
          <Register onSuccess={() => setView("login")} onSwitchToLogin={() => setView("login")} />
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
