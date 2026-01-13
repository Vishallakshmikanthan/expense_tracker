import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

export default function Categories() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name');
        if (data) setCategories(data);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory) return;
        try {
            setLoading(true);
            const { data, error } = await supabase.from('categories').insert({
                name: newCategory,
                type: 'expense',
                user_id: user.id
            }).select().single();

            if (error) throw error;
            setCategories([...categories, data]);
            setNewCategory('');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, isSystem) => {
        if (isSystem) return alert("Cannot delete system categories.");
        if (!window.confirm("Delete this category?")) return;

        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            setCategories(categories.filter(c => c.id !== id));
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
                <h2>Categories</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="New Category Name"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" className="btn" style={{ width: 'auto' }} disabled={loading}>
                            <Plus size={20} />
                        </button>
                    </form>
                </div>

                <div className="expense-list" style={{ padding: 0 }}>
                    {categories.map(cat => (
                        <div key={cat.id} className="expense-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="category-tag">{cat.name}</div>
                                {!cat.user_id && <span style={{ fontSize: '0.7rem', color: '#999', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>System</span>}
                            </div>
                            {cat.user_id && (
                                <button onClick={() => handleDelete(cat.id, !cat.user_id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff6b6b' }}>
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
