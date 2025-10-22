import React, { useState } from 'react';
import './TodoApp.css'; 
// CRITICAL CHANGE 1: Import the central URL and the helper function
import { BACKEND_URL, fetchWithCredentials } from "./api"; 

// CRITICAL CHANGE 2: Removed the local backendURL definition

// onLoginSuccess and onSwitchToRegister are functions passed from App.js
function Login({ onLoginSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // CRITICAL CHANGE 3: Use the fetchWithCredentials helper
            const response = await fetchWithCredentials(`${BACKEND_URL}/login`, {
                method: 'POST',
                // Note: headers: { 'Content-Type': 'application/json' } is now automatically handled by the wrapper
                body: JSON.stringify({ email, password }),
                // Note: credentials: 'include' is also automatically handled by the wrapper
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful (the cookie is now set on the client)
                setMessage(`Success: ${data.message}`);
                onLoginSuccess(); // Tell App.js to switch to the ToDo list
            } else {
                // Error from server (e.g., Invalid Credentials)
                setMessage(`Error: ${data.error || 'Login failed. Check email/password.'}`);
            }

        } catch (error) {
            console.error('Login Network Error:', error);
            setMessage('Network error. Could not connect to the server.');
        }
    };

    return (
        <div className="app">
            <div className="todo-container" style={{maxWidth: '400px'}}>
                <h1>🔑 Log In</h1>
                
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit">Log In</button>
                </form>

                {message && <p style={{color: message.startsWith('Error') ? 'red' : 'green', marginTop: '10px'}}>{message}</p>}
                
                <p style={{marginTop: '20px'}}>
                    Don't have an account? 
                    <button 
                        style={{marginLeft: '10px'}} 
                        onClick={onSwitchToRegister} 
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
