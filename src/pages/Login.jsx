import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/');
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
                animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                }}
                transition={{
                    opacity: { duration: 0.5, ease: 'easeOut' },
                    y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }
                }}
            >
                {/* App Branding */}
                <div className="auth-brand">
                    <h1>Expense Tracker</h1>
                    <p>Track. Save. Grow.</p>
                </div>

                <h2 className="auth-title">Welcome Back</h2>

                {error && (
                    <div className="error-msg">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                            placeholder="Enter your password"
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
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </motion.button>
                </form>

                <div className="link-text">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
            </motion.div>
        </div>
    );
}
