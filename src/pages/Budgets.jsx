import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Budgets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState([]);
    const [spending, setSpending] = useState({});
    const [categories, setCategories] = useState([]);

    // Form state
    const [selectedCategory, setSelectedCategory] = useState('_GLOBAL_'); // Default to Global
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

            // 1. Fetch Expenses (including type)
            const { data: expenses } = await supabase.from('expenses').select('amount, category, type').gte('date', startOfMonth).lte('date', endOfMonth);

            // Filter out Income
            const expenseItems = expenses.filter(item => item.type === 'expense');

            const spendingMap = expenseItems.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.amount;
                return acc;
            }, {});

            // Calculate Total Spending
            const totalSpent = expenseItems.reduce((acc, item) => acc + item.amount, 0);
            spendingMap['_GLOBAL_'] = totalSpent; // Special key for total

            setSpending(spendingMap);

            // 2. Fetch Budgets
            const { data: budgetData } = await supabase.from('budgets').select('*').eq('month', currentMonthStr);
            setBudgets(budgetData || []);

            // 3. Fetch Categories
            const { data: catData } = await supabase.from('categories').select('name').order('name');
            setCategories(catData || []);

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Home
                </button>
                <h2>Monthly Budgets</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>
                <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
                    <h4>Set Budget Limit</h4>
                    <form onSubmit={handleSetBudget} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="_GLOBAL_">Total Monthly Budget</option>
                            <option disabled>──────────</option>
                            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <div style={{ position: 'relative', width: 100 }}>
                            <span style={{ position: 'absolute', left: 10, top: 12, color: '#999' }}>₹</span>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.5rem 0.75rem 1.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <button type="submit" className="btn" style={{ width: 'auto' }}>Set</button>
                    </form>
                </div>

                <div className="expense-list" style={{ padding: 0 }}>
                    {/* Render Global Budget First */}
                    {(() => {
                        const globalBudget = budgets.find(b => b.category === '_GLOBAL_');
                        const globalSpent = spending['_GLOBAL_'] || 0;
                        const globalLimit = globalBudget ? globalBudget.amount : 0;
                        if (!globalBudget && globalSpent === 0) return null;

                        const pct = globalLimit > 0 ? (globalSpent / globalLimit) * 100 : 0;
                        const isOver = globalSpent > globalLimit && globalLimit > 0;

                        return (
                            <motion.div layout className="expense-item" style={{ display: 'block', border: '2px solid #6366f1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#6366f1' }}>Total Monthly Spending</span>
                                    <span>₹{globalSpent.toLocaleString()} / <span style={{ color: '#999' }}>{globalLimit || '∞'}</span></span>
                                </div>
                                <div style={{ height: 12, background: '#f1f3f5', borderRadius: 6, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(pct, 100)}%`,
                                        background: isOver ? '#ff6b6b' : '#6366f1',
                                        transition: 'width 0.5s ease-out'
                                    }}></div>
                                </div>
                            </motion.div>
                        );
                    })()}

                    {categories.map((cat, i) => {
                        const budgetItem = budgets.find(b => b.category === cat.name);
                        if (!budgetItem && !spending[cat.name]) return null;

                        const budgetAmount = budgetItem ? budgetItem.amount : 0;
                        const spent = spending[cat.name] || 0;
                        const pct = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                        const isOver = spent > budgetAmount && budgetAmount > 0;

                        return (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="expense-item"
                                style={{ display: 'block' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                    <span>₹{spent.toLocaleString()} / <span style={{ color: '#999' }}>{budgetAmount || '∞'}</span></span>
                                </div>
                                <div style={{ height: 8, background: '#f1f3f5', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(pct, 100)}%`,
                                        background: isOver ? '#ff6b6b' : '#34d399',
                                        transition: 'width 0.5s ease-out'
                                    }}></div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
