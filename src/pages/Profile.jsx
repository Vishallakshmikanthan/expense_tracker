import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User, Mail, Shield, Linkedin, Github, Code, Instagram, ExternalLink } from 'lucide-react';
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
        { icon: Github, name: 'GitHub', url: 'https://github.com/Vishallakshmikanthan', color: '#ffffff' },
        { icon: Code, name: 'LeetCode', url: 'https://leetcode.com/u/Vishal_Lakshmikanthan/', color: '#FFA116' },
        { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/xplorervishal', color: '#E4405F' }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <button
                    onClick={() => navigate('/')}
                    className="btn-logout"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ChevronLeft size={18} /> Back
                </button>
                <h2>Account Profile</h2>
                <div style={{ width: 60 }}></div>
            </header>

            <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* User Card */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(15, 157, 88, 0.3)'
                        }}>
                            <User size={40} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#F9FAFB' }}>
                                {user?.user_metadata?.username || 'User'}
                            </h3>
                            <span style={{
                                display: 'inline-block',
                                marginTop: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10B981',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                                Pro Plan
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="expense-item" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Mail size={18} className="text-secondary" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</div>
                                    <div style={{ color: 'var(--text-primary)' }}>{user?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="expense-item" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Shield size={18} className="text-secondary" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>User ID</div>
                                    <div style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{user?.id?.slice(0, 18)}...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-secondary"
                        style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                        <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Sign Out
                    </button>
                </div>

                {/* Credits / About Section */}
                <div className="stat-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>About the Creator</h3>
                    <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem' }}>
                        Designed & Developed by <strong style={{ color: '#F9FAFB' }}>Vishal Lakshmikanthan</strong>
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1rem'
                    }}>
                        {socialLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.25rem',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        textDecoration: 'none',
                                        color: 'var(--text-primary)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = link.color;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    <Icon size={24} color={link.color} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{link.name}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', paddingBottom: '2rem' }}>
                    © {new Date().getFullYear()} Expense Tracker. All rights reserved.
                </div>

            </div>
        </motion.div>
    );
}

