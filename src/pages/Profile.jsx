import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronLeft } from 'lucide-react';

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Home
                </button>
                <h2>Profile</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center' }}>
                    <div style={{ margin: '2rem auto', width: 100, height: 100, borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#4361ee' }}>
                        <User size={48} />
                    </div>

                    <h3>{user?.user_metadata?.username || 'User'}</h3>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>{user?.email}</p>

                    <button onClick={signOut} className="btn" style={{ background: '#ff6b6b' }}>
                        <LogOut size={18} style={{ marginRight: 8 }} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
