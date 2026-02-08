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
                <button
                    onClick={() => navigate('/')}
                    className="btn-logout"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ChevronLeft size={18} /> Home
                </button>
                <h2>Transactions</h2>
                <div style={{ width: 60 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                {/* Premium Filters Card */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Filter size={18} color="var(--brand-secondary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Filters</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 500 }}>Month</label>
                            <input
                                type="month"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    width: '100%',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--brand-secondary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 500 }}>Category</label>
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    width: '100%',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--brand-secondary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
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
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{item.category}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                    {item.description && <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{item.description}</div>}
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span className="expense-amount" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: item.type === 'income' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {item.type === 'income' ? '+' : '-'}<IndianRupee size={16} strokeWidth={2.5} />{item.amount.toLocaleString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => navigate(`/edit/${item.id}`)}
                                            className="btn-logout"
                                            style={{
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                color: '#3B82F6',
                                                border: '1px solid rgba(59, 130, 246, 0.2)'
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="btn-logout"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#EF4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {expenses.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No transactions found.</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
