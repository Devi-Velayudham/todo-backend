import React, { useState } from 'react';
import TodoApp from './TodoApp'; 
import Register from './Register'; 
import Login from './Login'; 

const BACKEND_URL = "https://todo-backend-sawo.onrender.com"; // Define the URL once

function App() {
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
            // Log the error but proceed with client state reset
            console.error("Logout request failed:", error);
        }
        
        // 2. Reset frontend state, which automatically switches the view to Login
        setIsAuthenticated(false); 
        setCurrentView('login');  
    };
    // ----------------------------

    const handleLoginSuccess = () => {
        setIsAuthenticated(true); 
        setCurrentView('todo');    
    };
    
    const handleRegisterSuccess = () => {
        setCurrentView('login'); 
    }

    // --- RENDER LOGIC ---
    
    // 1. If the user is authenticated, show the ToDo list and pass the logout handler.
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
    
    // 3. Otherwise, show the Login page.
    return (
        <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView('register')} 
        />
    );
}

export default App;
