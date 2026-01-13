import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditExpense() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Categories
            const { data: catData } = await supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name');
            setCategories(catData || []);

            // 2. Fetch Expense Detail
            const { data: expData, error } = await supabase.from('expenses').select('*').eq('id', id).single();
            if (error) throw error;

            if (expData) {
                setFormData({
                    amount: expData.amount,
                    category: expData.category,
                    description: expData.description || '',
                    date: new Date(expData.date).toISOString().split('T')[0]
                });
            }
        } catch (error) {
            alert(error.message);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase.from('expenses').update({
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: new Date(formData.date).toISOString()
            }).eq('id', id);

            if (error) throw error;
            navigate('/expenses');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate(-1)} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Back
                </button>
                <h2>Edit Transaction</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%' }}>
                    {loading ? <p>Loading...</p> : (
                        <form onSubmit={handleSubmit}>
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
                                >
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
                                    placeholder="Dinner, Taxi, etc."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 1 }}>Update</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
