import React, { useState } from 'react';
import TodoApp from './TodoApp'; // Your original ToDo list component
import Register from './Register'; 
import Login from './Login'; 

function App() {
    // 1. State for Login Status (Will be set to true upon successful login)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // 2. State to control which form/view to show: 'login' (default) or 'register' or 'todo'
    const [currentView, setCurrentView] = useState('login'); 

    // Function called by Login.js when login succeeds
    const handleLoginSuccess = () => {
        setIsAuthenticated(true); 
        setCurrentView('todo');    // Switch to the ToDo list
    };
    
    // Function called by Register.js when registration succeeds
    const handleRegisterSuccess = () => {
        setCurrentView('login'); // After signing up, send them to the Login screen
    }

    // --- RENDER LOGIC ---
    
    // 1. If the user is authenticated, show the ToDo list.
    if (isAuthenticated) {
        // NOTE: We will add a logout function later
        return <TodoApp />; 
    }

    // 2. If not authenticated, check which form to show.
    if (currentView === 'register') {
        return (
            <Register 
                onSuccess={handleRegisterSuccess} 
                onSwitchToLogin={() => setCurrentView('login')} // Button on Register page calls this
            />
        );
    }
    
    // 3. Otherwise (if currentView is 'login' or default), show the Login page.
    return (
        <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView('register')} // Button on Login page calls this
        />
    );
}

export default App;