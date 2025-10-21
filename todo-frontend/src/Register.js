import React, { useState } from 'react';
import './TodoApp.css'; // Use the same CSS for styling

// --- CHANGE 1: Accept props from App.js ---
function Register({ onSuccess, onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    // Use the live backend URL
    const backendURL = "https://todo-backend-sawo.onrender.com"; 

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`${backendURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success!
                setMessage(`Success: ${data.message} Please log in.`);
                setEmail('');
                setPassword('');
                
                // --- CHANGE 2: Call onSuccess to switch view ---
                onSuccess(); 
            } else {
                // Error from server (e.g., email already exists)
                setMessage(`Error: ${data.error || 'Registration failed.'}`);
            }

        } catch (error) {
            setMessage('Network error. Could not connect to the server.');
        }
    };

    return (
        <div className="app">
            <div className="todo-container" style={{maxWidth: '400px'}}>
                <h1>📝 Sign Up</h1>
                
                <form onSubmit={handleRegister}>
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
                    <button type="submit">Register</button>
                </form>

                {/* Display messages */}
                {message && <p style={{color: message.startsWith('Error') ? 'red' : 'green', marginTop: '10px'}}>{message}</p>}
                
                <p style={{marginTop: '20px'}}>
                    Already have an account? 
                    {/* --- CHANGE 3: Use a button to call onSwitchToLogin --- */}
                    <button 
                        style={{marginLeft: '10px', textDecoration: 'underline'}} 
                        onClick={onSwitchToLogin}
                    >
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;