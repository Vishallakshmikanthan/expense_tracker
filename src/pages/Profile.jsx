import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User, Mail, Shield } from 'lucide-react';
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
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Home
                </button>
                <h2>My Profile</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="auth-card" style={{ maxWidth: 500, padding: '3rem 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1rem',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                        }}>
                            <User size={40} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{user?.user_metadata?.username || 'User'}</h3>
                        <span style={{ color: '#6b7280' }}>Free Plan</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="expense-item" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Mail size={20} color="#6b7280" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase' }}>Email</div>
                                    <div>{user?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="expense-item" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Shield size={20} color="#6b7280" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase' }}>User ID</div>
                                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{user?.id}</div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: '#ef4444', marginTop: '1rem', width: '100%' }}>
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
