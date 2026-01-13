import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function AddExpense() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense' // Default
    });

    useEffect(() => {
        if (user) { // Ensure user is loaded before fetching categories
            fetchCategories();
        }
    }, [user]); // Re-fetch when user changes

    const fetchCategories = async () => {
        try {
            // Fetch categories filtered by type (default 'expense')
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .or(`user_id.is.null,user_id.eq.${user.id}`)
                .eq('type', formData.type) // Filter by selected type
                .order('name');

            if (error) throw error;
            setCategories(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            } else {
                setFormData(prev => ({ ...prev, category: '' }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Re-fetch when type changes
    useEffect(() => {
        if (user) { // Ensure user is loaded before fetching categories
            fetchCategories();
        }
    }, [formData.type, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category) return;

        try {
            setLoading(true);
            // We rely on the category to define the type implicitly for now, 
            // but since we filter categories by type, we ensure consistency.
            const { error } = await supabase.from('expenses').insert({
                user_id: user.id,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: new Date(formData.date).toISOString()
            });

            if (error) throw error;
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate(-1)} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Back
                </button>
                <h2>Add Transaction</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Type</label>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    className={`btn ${formData.type === 'expense' ? '' : 'btn-secondary'}`}
                                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                                    style={{ flex: 1, backgroundColor: formData.type === 'expense' ? '#ef4444' : '#fff', color: formData.type === 'expense' ? '#fff' : '#333' }}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${formData.type === 'income' ? '' : 'btn-secondary'}`}
                                    onClick={() => setFormData({ ...formData, type: 'income' })}
                                    style={{ flex: 1, backgroundColor: formData.type === 'income' ? '#10b981' : '#fff', color: formData.type === 'income' ? '#fff' : '#333' }}
                                >
                                    Income
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                min="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                disabled={categories.length === 0}
                            >
                                {categories.length === 0 && <option value="">No categories found for {formData.type}</option>}
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            {categories.length === 0 && <div style={{ marginTop: 5, fontSize: '0.8rem' }}>Go to <a href="/categories">Categories</a> to add {formData.type} categories.</div>}
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Note (Optional)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Expense'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
