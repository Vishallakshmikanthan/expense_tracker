import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function EditExpense() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchExpense();
    }, [id]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name');
        if (data) setCategories(data);
    };

    const fetchExpense = async () => {
        try {
            const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
            if (error) throw error;
            setFormData({
                amount: data.amount,
                category: data.category,
                description: data.description,
                date: new Date(data.date).toISOString().split('T')[0]
            });
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

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading...</div>;

    return (
        <div className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate(-1)} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Back
                </button>
                <h2>Edit Expense</h2>
                <div style={{ width: 32 }}></div>
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
                            {loading ? 'Updating...' : 'Update Expense'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
