import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Specific requirement: User ID 1, Password 'password'
        if (userId === '1' && password === 'password') {
            onLogin(); // Call parent login success function
        } else {
            setError('Invalid User ID or Password. Try again.');
        }
    };

    return (
        <div className="login-page fade-in">
            <div className="login-container">
                <div className="login-card">
                    <div className="brand-section">
                        <div className="logo-placeholder">R</div>
                        <h1>RITES SARTHI</h1>
                        <p>Process IE Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>User ID</label>
                            <input
                                type="text"
                                placeholder="Enter User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button type="submit" className="login-btn">
                            Login to Portal
                        </button>
                    </form>
                </div>
            </div>

            <div className="login-footer">
                © 2026 RITES Ltd | DKG Guest/Rites-Sleeper
            </div>
        </div>
    );
};

export default LoginPage;
