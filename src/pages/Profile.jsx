import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User, Mail, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <motion.button
                    onClick={() => navigate('/')}
                    className="btn-logout"
                    style={{ display: 'flex', alignItems: 'center' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronLeft size={20} /> Home
                </motion.button>
                <h2>My Profile</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '3rem 2rem',
                        maxWidth: 500,
                        width: '100%',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Gradient decoration */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #10b981 100%)'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                marginBottom: '1.25rem',
                                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                                position: 'relative'
                            }}
                        >
                            <User size={48} strokeWidth={2} />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: '3px solid white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={14} />
                            </div>
                        </motion.div>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{user?.user_metadata?.username || 'User'}</h3>
                        <span style={{
                            fontSize: '0.9rem',
                            color: 'white',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '0.375rem 1rem',
                            borderRadius: '999px',
                            marginTop: '0.5rem',
                            fontWeight: 500
                        }}>Free Plan</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <motion.div
                            className="expense-item"
                            style={{ marginBottom: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Mail size={20} color="#10b981" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Email</div>
                                    <div style={{ fontWeight: 500, marginTop: 2 }}>{user?.email}</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="expense-item"
                            style={{ marginBottom: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Shield size={20} color="#667eea" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>User ID</div>
                                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginTop: 2, color: '#6b7280' }}>{user?.id?.slice(0, 24)}...</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            onClick={handleLogout}
                            className="btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                                color: '#dc2626',
                                marginTop: '1rem',
                                width: '100%',
                                border: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            <LogOut size={20} /> Sign Out
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
