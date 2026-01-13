import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Budgets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState([]);
    const [spending, setSpending] = useState({});
    const [categories, setCategories] = useState([]);

    // Form state
    const [selectedCategory, setSelectedCategory] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            // 1. Fetch Expenses for aggregation
            const { data: expenses } = await supabase.from('expenses').select('amount, category').gte('date', startOfMonth).lte('date', endOfMonth);
            const spendingMap = expenses.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.amount;
                return acc;
            }, {});
            setSpending(spendingMap);

            // 2. Fetch Existing Budgets
            const { data: budgetData } = await supabase.from('budgets').select('*').eq('month', currentMonthStr);
            setBudgets(budgetData || []);

            // 3. Fetch Categories
            const { data: catData } = await supabase.from('categories').select('name').order('name');
            setCategories(catData || []);
            if (catData.length > 0) setSelectedCategory(catData[0].name);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBudget = async (e) => {
        e.preventDefault();
        if (!amount || !selectedCategory) return;
        try {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            // Upsert logic: Delete old, insert new (for simplicity as constraints are unique)
            await supabase.from('budgets').delete().match({ user_id: user.id, category: selectedCategory, month: currentMonthStr });
            const { error } = await supabase.from('budgets').insert({
                user_id: user.id,
                category: selectedCategory,
                month: currentMonthStr,
                amount: parseFloat(amount)
            });

            if (error) throw error;
            setAmount('');
            fetchData();
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
                <h2>Monthly Budgets</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                {/* Budget Form */}
                <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
                    <h4>Set Limit for this Month</h4>
                    <form onSubmit={handleSetBudget} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: 100, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" className="btn" style={{ width: 'auto' }}>Set</button>
                    </form>
                </div>

                {/* Overview List */}
                <div className="expense-list" style={{ padding: 0 }}>
                    {categories.map(cat => {
                        const budgetItem = budgets.find(b => b.category === cat.name);
                        if (!budgetItem && !spending[cat.name]) return null; // Hide unused if no budget/spending

                        const budgetAmount = budgetItem ? budgetItem.amount : 0;
                        const spent = spending[cat.name] || 0;
                        const pct = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                        const isOver = spent > budgetAmount && budgetAmount > 0;

                        return (
                            <div key={cat.name} className="expense-item" style={{ display: 'block' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                    <span>${spent} / <span style={{ color: '#999' }}>{budgetAmount || '∞'}</span></span>
                                </div>
                                <div style={{ height: 8, background: '#f1f3f5', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(pct, 100)}%`,
                                        background: isOver ? '#ff6b6b' : '#34c759',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                                {isOver && <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginTop: 4 }}>Over budget!</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
