import React, { useState, useEffect } from "react";
import Login from "./Login";
import TodoApp from "./TodoApp";
import Register from "./Register";
import "./App.css";

const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

function App() {
  // State to track the current user (used to determine if logged in)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to manage the current view (login, register, or todo app)
  const [view, setView] = useState("login"); 
  
  // A simple function to check if the user is logged in by hitting a protected endpoint
  // This is a common pattern to check session status on app load/refresh
  const checkAuthStatus = async () => {
      try {
          const response = await fetch(`${BACKEND_URL}/todos`, {
              method: 'GET',
              credentials: 'include'
          });

          // If the server returns 200, the cookie is valid and we are logged in
          if (response.ok) {
              setIsLoggedIn(true);
              setView('todo');
          } else {
              // If it returns 401 or any other non-ok status, we are logged out
              setIsLoggedIn(false);
              setView('login');
          }
      } catch (error) {
          console.error("Error checking auth status:", error);
          setIsLoggedIn(false);
          setView('login');
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
    try {
        // *** CRITICAL FIX: Change method to POST to match server.js ***
        await fetch(`${BACKEND_URL}/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        
    } catch (error) {
        console.error("Logout request failed:", error);
        // We proceed with client-side logout even if the request fails 
        // to ensure the UI is usable.
    } finally {
        // Regardless of request success, reset client state to logged out
        setIsLoggedIn(false);
        setView("login");
    }
  };


  const renderContent = () => {
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
