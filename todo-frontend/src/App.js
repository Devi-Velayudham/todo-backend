import React, { useState } from 'react';
import TodoApp from './TodoApp'; 
import Register from './Register'; 
import Login from './Login'; 

const BACKEND_URL = "https://todo-backend-sawo.onrender.com"; // Define the URL once

function App() {
    // isAuthenticated must be TRUE to show TodoApp
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [currentView, setCurrentView] = useState('login'); 

    // --- LOGOUT FUNCTION ---
    const handleLogout = async () => {
        // 1. Tell the backend to clear the cookie
        try {
            await fetch(`${BACKEND_URL}/logout`, {
                method: 'GET',
                credentials: 'include', // Send the cookie so the backend knows which one to clear
            });
        } catch (error) {
            console.error("Logout request failed (this is often fine):", error);
        }
        
        // 2. Reset frontend state
        setIsAuthenticated(false); 
        setCurrentView('login');  
    };
    // ----------------------------

    // CRITICAL: This is called ONLY from Login.js on successful login (HTTP 200)
    const handleLoginSuccess = () => {
        setIsAuthenticated(true); // SETS AUTHENTICATED TO TRUE
        setCurrentView('todo');     // SWITCHES VIEW TO TODO
    };
    
    const handleRegisterSuccess = () => {
        setCurrentView('login'); 
    }

    // --- RENDER LOGIC ---
    
    // 1. If isAuthenticated is TRUE, this is the screen the user MUST see.
    if (isAuthenticated) {
        // Pass the logout function as a prop
        return <TodoApp onLogout={handleLogout} />; 
    }

    // 2. If not authenticated, check which form to show.
    if (currentView === 'register') {
        return (
            <Register 
                onSuccess={handleRegisterSuccess} 
                onSwitchToLogin={() => setCurrentView('login')} 
            />
        );
    }
    
    // 3. Default (currentView === 'login' AND !isAuthenticated)
    return (
        <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView('register')} 
        />
    );
}

export default App;
