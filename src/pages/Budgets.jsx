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
                        const isNearLimit = pct >= 80 && pct < 100;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="expense-item"
                                style={{
                                    display: 'block',
                                    border: `2px solid ${isOver ? '#EF4444' : isNearLimit ? '#F59E0B' : '#667eea'}`,
                                    background: isOver
                                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)'
                                        : isNearLimit
                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)'
                                            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(102, 126, 234, 0.02) 100%)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#667eea' }}>Total Monthly Budget</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                            <IndianRupee size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{globalSpent.toLocaleString()}
                                        </span>
                                        <span style={{ color: '#94A3B8' }}>/</span>
                                        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
                                            <IndianRupee size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{globalLimit || '∞'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ position: 'relative', height: 14, background: '#F1F5F9', borderRadius: 8, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            background: isOver
                                                ? 'linear-gradient(90deg, #F87171 0%, #EF4444 100%)'
                                                : isNearLimit
                                                    ? 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)'
                                                    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: 8,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                            animation: 'shimmer 2s infinite'
                                        }} />
                                    </motion.div>
                                </div>
                                {isNearLimit && !isOver && (
                                    <div style={{ fontSize: '0.75rem', color: '#F59E0B', marginTop: '0.5rem', fontWeight: 500 }}>
                                        ⚠️ {Math.round(100 - pct)}% remaining
                                    </div>
                                )}
                                {isOver && (
                                    <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.5rem', fontWeight: 500 }}>
                                        🔴 Over budget by ₹{(globalSpent - globalLimit).toLocaleString()}
                                    </div>
                                )}
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
                        const isNearLimit = pct >= 80 && pct < 100;

                        return (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, type: 'spring' }}
                                whileHover={{ x: 4 }}
                                className="expense-item"
                                style={{
                                    display: 'block',
                                    borderLeft: `4px solid ${isOver ? '#EF4444' : isNearLimit ? '#F59E0B' : '#10B981'}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                            <IndianRupee size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />{spent.toLocaleString()}
                                        </span>
                                        <span style={{ color: '#94A3B8' }}>/</span>
                                        <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                                            <IndianRupee size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />{budgetAmount || '∞'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ position: 'relative', height: 10, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            background: isOver
                                                ? 'linear-gradient(90deg, #F87171 0%, #EF4444 100%)'
                                                : isNearLimit
                                                    ? 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)'
                                                    : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                                            borderRadius: 6
                                        }}
                                    />
                                </div>
                                {pct > 0 && (
                                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.5rem' }}>
                                        {Math.round(pct)}% spent
                                        {isNearLimit && !isOver && ' ⚠️'}
                                        {isOver && ' 🔴'}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
