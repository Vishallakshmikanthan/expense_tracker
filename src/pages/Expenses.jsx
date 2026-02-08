import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Edit2, Filter, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Expenses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterCategory, setFilterCategory] = useState('All');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, [filterDate, filterCategory]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('name');
        if (data) setCategories(data);
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (filterDate) {
                const [year, month] = filterDate.split('-');
                const start = new Date(year, month - 1, 1).toISOString();
                const end = new Date(year, month, 0).toISOString();
                query = query.gte('date', start).lte('date', end);
            }

            if (filterCategory !== 'All') {
                query = query.eq('category', filterCategory);
            }

            const { data, error } = await query;
            if (error) throw error;
            setExpenses(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await supabase.from('expenses').delete().eq('id', id);
            setExpenses(expenses.filter(ex => ex.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Home
                </button>
                <h2>Transactions</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                {/* Premium Filters Card */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Filter size={20} color="#667eea" />
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>Filters</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 6, display: 'block', fontWeight: 500 }}>Month</label>
                            <input
                                type="month"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    width: '100%',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 6, display: 'block', fontWeight: 500 }}>Category</label>
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    width: '100%',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.95rem',
                                    background: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </motion.div>

                <div className="expense-list" style={{ padding: 0 }}>
                    <AnimatePresence>
                        {expenses.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item.id}
                                className="expense-item"
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{item.category}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                    {item.description && <div style={{ fontSize: '0.9rem', color: '#555', marginTop: 4 }}>{item.description}</div>}
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span className="expense-amount" style={{ display: 'flex', alignItems: 'center', color: item.type === 'income' ? '#10b981' : '#ef4444' }}>
                                        {item.type === 'income' ? '+' : '-'}<IndianRupee size={16} strokeWidth={2.5} />{item.amount}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => navigate(`/edit/${item.id}`)} className="btn-logout" style={{ background: '#f3f4f6', color: '#6366f1' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="btn-logout">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {expenses.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No transactions found.</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
