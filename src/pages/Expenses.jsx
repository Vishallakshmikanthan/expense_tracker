import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Filter } from 'lucide-react';

export default function Expenses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchCategories();
        fetchExpenses();
    }, [selectedMonth, selectedCategory]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${user.id}`);
        if (data) setCategories(data);
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            // Apply Month Filter
            if (selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                const startDate = new Date(year, month - 1, 1).toISOString();
                const endDate = new Date(year, month, 0).toISOString();
                query = query.gte('date', startDate).lte('date', endDate);
            }

            // Apply Category Filter
            if (selectedCategory !== 'All') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;
            if (error) throw error;
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            setExpenses(expenses.filter(ex => ex.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Home
                </button>
                <h2>Expenses</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '1rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Month</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="expense-list" style={{ padding: 0 }}>
                    {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : expenses.length === 0 ? (
                        <p className="empty-state">No expenses found.</p>
                    ) : (
                        expenses.map(item => (
                            <div key={item.id} className="expense-item">
                                <div className="expense-left">
                                    <div className="category-tag">{item.category}</div>
                                    <div>
                                        <div className="expense-note">{item.description || 'No description'}</div>
                                        <div className="expense-date">{new Date(item.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="expense-amount">-${item.amount}</div>
                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
