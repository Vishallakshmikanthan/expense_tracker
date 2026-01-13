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
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            // Fetch system and user categories
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .or(`user_id.is.null,user_id.eq.${user.id}`)
                .order('name');

            if (error) throw error;
            setCategories(data);
            if (data.length > 0) setFormData(prev => ({ ...prev, category: data[0].name }));
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('expenses').insert({
                user_id: user.id,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: new Date(formData.date).toISOString() // Store as ISO
            });

            if (error) throw error;
            navigate('/');
        } catch (error) {
            alert(error.message); // Basic error handling for now
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
                <h2>Add Expense</h2>
                <div style={{ width: 32 }}></div> {/* Spacer */}
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Amount ($)</label>
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
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
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
