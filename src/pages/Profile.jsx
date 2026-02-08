import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User, Mail, Shield, Sparkles, Linkedin, Github, Code, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const socialLinks = [
        { icon: Linkedin, name: 'LinkedIn', url: 'https://www.linkedin.com/in/vishallakshmikanthan', color: '#0077b5' },
        { icon: Github, name: 'GitHub', url: 'https://github.com/Vishallakshmikanthan', color: '#f1f5f9' },
        { icon: Code, name: 'LeetCode', url: 'https://leetcode.com/u/Vishal_Lakshmikanthan/', color: '#FFA116' },
        { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/xplorervishal', color: '#E4405F' }
    ];

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

            <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {/* User Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '3rem 2rem',
                        maxWidth: 500,
                        width: '100%',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
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
                        background: 'linear-gradient(90deg, #a78bfa 0%, #c084fc 50%, #10b981 100%)'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 12px 32px rgba(167, 139, 250, 0.4)',
                                    '0 12px 48px rgba(167, 139, 250, 0.6)',
                                    '0 12px 32px rgba(167, 139, 250, 0.4)'
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                marginBottom: '1.25rem',
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
                                border: '3px solid rgba(15, 23, 42, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={14} />
                            </div>
                        </motion.div>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>{user?.user_metadata?.username || 'User'}</h3>
                        <span style={{
                            fontSize: '0.9rem',
                            color: 'white',
                            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',
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
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Mail size={20} color="#10b981" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Email</div>
                                    <div style={{ fontWeight: 500, marginTop: 2, color: '#f1f5f9' }}>{user?.email}</div>
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
                                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Shield size={20} color="#a78bfa" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>User ID</div>
                                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginTop: 2, color: 'rgba(255, 255, 255, 0.7)' }}>{user?.id?.slice(0, 24)}...</div>
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
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <LogOut size={20} /> Sign Out
                        </motion.button>
                    </div>
                </motion.div>

                {/* Creator Credits Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2rem',
                        maxWidth: 500,
                        width: '100%',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #a78bfa 100%)'
                    }} />

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#f1f5f9',
                            marginBottom: '0.5rem'
                        }}>Created By</h3>
                        <p style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #10b981 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Vishal Lakshmikanthan</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.75rem'
                    }}>
                        {socialLinks.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <motion.a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: `0 8px 24px ${link.color}40`
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        textDecoration: 'none',
                                        color: '#f1f5f9',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 'var(--radius-md)',
                                        background: `${link.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon size={18} color={link.color} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{link.name}</span>
                                </motion.a>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
