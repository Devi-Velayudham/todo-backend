import React, { useState } from 'react';
import './TodoApp.css'; 

// Define the backend URL once
const backendURL = "https://todo-backend-sawo.onrender.com"; 

// onLoginSuccess and onSwitchToRegister are functions passed from App.js
function Login({ onLoginSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`${backendURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                // CRITICAL FIX: Include credentials so the browser accepts the HTTP-only cookie
                credentials: 'include', 
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
