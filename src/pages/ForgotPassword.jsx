import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
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
                {/* Back Button */}
                <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#f1f5f9',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ArrowLeft size={20} />
                </motion.button>

                {/* App Branding */}
                <div className="auth-brand">
                    <h1>Expense Tracker</h1>
                    <p>Track. Save. Grow.</p>
                </div>

                {!success ? (
                    <>
                        <h2 className="auth-title">Reset Password</h2>
                        <p style={{
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '2rem',
                            fontSize: '0.9rem'
                        }}>
                            Enter your email and we'll send you a reset link
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
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="premium-input"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="btn auth-btn"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
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
                            Check Your Email
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            We've sent a password reset link to<br />
                            <strong style={{ color: '#a78bfa' }}>{email}</strong>
                        </p>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-block',
                                color: '#a78bfa',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem'
                            }}
                        >
                            Back to Login →
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
