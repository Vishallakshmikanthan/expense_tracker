import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [hasValidToken, setHasValidToken] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Supabase automatically handles the recovery token from URL hash
                // Just check if we have a valid session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Session error:', error);
                    setError('Invalid or expired reset link. Please request a new one.');
                    setHasValidToken(false);
                } else if (!session) {
                    setError('No active session. Please request a new password reset link.');
                    setHasValidToken(false);
                } else {
                    // Valid session from recovery token
                    setHasValidToken(true);
                }
            } catch (err) {
                console.error('Initialize error:', err);
                setError('Failed to initialize password reset. Please try again.');
                setHasValidToken(false);
            } finally {
                setInitializing(false);
            }
        };

        initializeSession();
    }, []);

    const validatePassword = () => {
        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) return;

        try {
            setError('');
            setLoading(true);

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while initializing
    if (initializing) {
        return (
            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '3rem' }}
                >
                    <div className="auth-brand">
                        <h1>Expense Tracker</h1>
                        <p>Track. Save. Grow.</p>
                    </div>
                    <Loader2
                        size={48}
                        color="#a78bfa"
                        style={{
                            animation: 'spin 1s linear infinite',
                            margin: '2rem auto',
                            display: 'block'
                        }}
                    />
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Verifying reset link...
                    </p>
                </motion.div>
            </div>
        );
    }

    // Show error state if no valid token
    if (!hasValidToken && !initializing) {
        return (
            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="auth-brand">
                        <h1>Expense Tracker</h1>
                        <p>Track. Save. Grow.</p>
                    </div>

                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
                        }}>
                            <AlertCircle size={40} color="white" />
                        </div>
                        <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                            Invalid Reset Link
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            {error || 'This password reset link is invalid or has expired.'}
                        </p>
                        <motion.button
                            onClick={() => navigate('/forgot-password')}
                            className="btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ marginBottom: '0.5rem' }}
                        >
                            Request New Link
                        </motion.button>
                        <br />
                        <motion.button
                            onClick={() => navigate('/login')}
                            className="btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Back to Login
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

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

                {!success ? (
                    <>
                        <h2 className="auth-title">Set New Password</h2>
                        <p style={{
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '2rem',
                            fontSize: '0.9rem'
                        }}>
                            Enter your new password below
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="error-msg"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input"
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="premium-input"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="password-toggle"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <motion.button
                                type="submit"
                                className="btn auth-btn"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '2rem 0' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            <CheckCircle size={40} color="white" />
                        </motion.div>
                        <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                            Password Updated!
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                            Redirecting to login...
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
