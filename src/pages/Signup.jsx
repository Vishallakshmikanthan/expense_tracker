import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { data, error } = await signUp(email, password, username);
            if (error) throw error;

            // If session exists, user is logged in (Email Confirm Disabled)
            if (data.session) {
                navigate('/');
            } else {
                // Email Confirm Enabled
                alert("Please check your email for the confirmation link.");
                navigate('/login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* App Branding */}
                <div className="auth-brand">
                    <h1>Expense Tracker</h1>
                    <p>Track. Save. Grow.</p>
                </div>

                <h2 className="auth-title">Create Account</h2>

                {error && (
                    <div className="error-msg">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Username Input */}
                    <div className="input-wrapper">
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="premium-input"
                            placeholder="Choose a username"
                        />
                        <User size={20} className="input-icon" />
                    </div>

                    {/* Email Input */}
                    <div className="input-wrapper">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="premium-input"
                            placeholder="Enter your email"
                        />
                        <Mail size={20} className="input-icon" />
                    </div>

                    {/* Password Input */}
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="premium-input"
                            placeholder="Create a password"
                            style={{ paddingRight: '3rem' }}
                        />
                        <Lock size={20} className="input-icon" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-premium"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="pulse" style={{ animation: 'pulse 1s infinite' }} />
                                Creating Account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </motion.button>
                </form>

                <div className="link-text">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </motion.div>
        </div>
    );
}
