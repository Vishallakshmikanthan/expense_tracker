import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Wallet, TrendingDown, TrendingUp, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);
    const [budgetLimit, setBudgetLimit] = useState(0);
    const [recentExpenses, setRecentExpenses] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            // 1. Fetch Expenses (Only 'expense' type)
            const { data: expenses, error: expError } = await supabase
                .from('expenses')
                .select('*')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)
                .order('date', { ascending: false });

            if (expError) throw expError;

            // Filter only 'expense' type for Total Spent
            const spending = expenses
                .filter(item => item.type === 'expense')
                .reduce((acc, item) => acc + item.amount, 0);

            setTotalSpent(spending);
            setRecentExpenses(expenses.slice(0, 5));

            // 2. Fetch Total Budget (Special Category '_GLOBAL_')
            const { data: globalBudget, error: budError } = await supabase
                .from('budgets')
                .select('amount')
                .eq('month', currentMonthStr)
                .eq('category', '_GLOBAL_')
                .single();

            if (!budError && globalBudget) {
                setBudgetLimit(globalBudget.amount);
            } else {
                setBudgetLimit(0); // No global budget set
            }

        } catch (error) {
            console.error('Error loading dashboard:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const remaining = budgetLimit - totalSpent;
    const isOverBudget = remaining < 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dashboard"
        >
            <header className="app-header">
                <h1>Welcome, {user?.user_metadata?.username || 'User'}</h1>
                <div className="nav-links">
                    <Link to="/expenses" className="btn btn-secondary">Expenses</Link>
                    <Link to="/savings" className="btn btn-secondary">Savings</Link>
                    <Link to="/budgets" className="btn btn-secondary">Budgets</Link>
                    <Link to="/profile" className="btn btn-secondary">Profile</Link>
                    <button onClick={signOut} className="btn-logout" title="Sign Out"><LogOut size={20} /></button>
                </div>
            </header>

            <div className="stats-grid">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="stat-card"
                    style={{
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        border: 'none'
                    }}
                >
                    <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <Wallet size={24} strokeWidth={2} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Spent</span>
                        <span className="stat-value" style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                            <IndianRupee size={22} strokeWidth={2.5} />{totalSpent.toLocaleString()}
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    className="stat-card"
                    style={{
                        background: isOverBudget
                            ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
                            : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none'
                    }}
                >
                    <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        {isOverBudget ? <TrendingDown size={24} strokeWidth={2} /> : <TrendingUp size={24} strokeWidth={2} />}
                    </div>
                    <div className="stat-info">
                        <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Remaining Budget</span>
                        <span className="stat-value" style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                            <IndianRupee size={22} strokeWidth={2.5} />{remaining.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>
                            {budgetLimit > 0 ? `of ₹${budgetLimit.toLocaleString()}` : 'No limit set'}
                        </span>
                    </div>
                </motion.div>
            </div>

            <div className="section-header" style={{ padding: '0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Recent Activity</h2>
                <Link
                    to="/add"
                    className="btn"
                    style={{
                        boxShadow: '0 4px 15px rgba(15, 157, 88, 0.4)',
                        textDecoration: 'none'
                    }}
                >
                    <Plus size={18} strokeWidth={2.5} /> Add Transaction
                </Link>
            </div>

            <div className="expense-list" style={{ padding: '0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="pulse" style={{ display: 'inline-block', fontSize: '1rem', color: 'var(--text-secondary)' }}>Loading...</div>
                    </div>
                ) : recentExpenses.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px dashed var(--border-color)'
                    }}>
                        <Wallet size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No transactions this month</p>
                    </div>
                ) : (
                    recentExpenses.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                            className="expense-item"
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: 'var(--radius-md)',
                                    background: item.type === 'income'
                                        ? 'rgba(16, 185, 129, 0.1)'
                                        : 'rgba(239, 68, 68, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${item.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    {item.type === 'income'
                                        ? <TrendingUp size={18} color="#10B981" strokeWidth={2.5} />
                                        : <TrendingDown size={18} color="#EF4444" strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                        {item.description || item.category}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {item.category} • {new Date(item.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="expense-amount" style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 700,
                                color: item.type === 'income' ? 'var(--success)' : 'var(--text-primary)'
                            }}>
                                {item.type === 'income' ? '+' : ''}<IndianRupee size={16} strokeWidth={2.5} />{item.amount.toLocaleString()}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
