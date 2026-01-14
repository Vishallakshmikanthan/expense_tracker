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

            // ... (rest of function logic unchanged)
            // [SKIP MATCHING MIDDLE CONTENT AND JUMP TO UI LOOP]
            // Actually, since I can't skip, I will use multi_replace.
            // Aborting this call to use multi_replace for accuracy.

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
                <motion.div whileHover={{ y: -2 }} className="stat-card">
                    <div className="stat-icon">
                        <Wallet size={20} strokeWidth={1.5} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Spent</span>
                        <span className="stat-value" style={{ display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={20} strokeWidth={2} />{totalSpent.toLocaleString()}
                        </span>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="stat-card">
                    <div className="stat-icon">
                        {isOverBudget ? <TrendingDown size={20} color="#EB5757" /> : <TrendingUp size={20} color="#27AE60" />}
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Remaining Budget</span>
                        <span className={`stat-value ${isOverBudget ? 'text-danger' : 'text-success'}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={20} strokeWidth={2} />{remaining.toLocaleString()}
                        </span>
                        <span className="stat-sub" style={{ fontSize: '0.8rem', color: '#999' }}>{budgetLimit > 0 ? `of ₹${budgetLimit.toLocaleString()}` : 'No limit set'}</span>
                    </div>
                </motion.div>
            </div>

            <div className="section-header" style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Recent Expenses</h2>
                <Link to="/add" className="btn-fab"><Plus size={28} /></Link>
            </div>

            <div className="expense-list" style={{ padding: '0 1.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : recentExpenses.length === 0 ? (
                    <p className="empty-state">No expenses this month.</p>
                ) : (
                    recentExpenses.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="expense-item"
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ 
                                    padding: '8px', 
                                    borderRadius: '4px',
                                    background: item.type === 'income' ? '#F0FDF4' : '#FEF2F2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {item.type === 'income' ? <TrendingUp size={16} color="#27AE60" /> : <TrendingDown size={16} color="#EB5757" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{item.description || item.category}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                        {item.category} • {new Date(item.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="expense-amount" style={{ 
                                display: 'flex', alignItems: 'center', 
                                color: item.type === 'income' ? '#27AE60' : '#37352F' 
                            }}>
                                {item.type === 'income' ? '+' : ''}<IndianRupee size={14} strokeWidth={2} />{item.amount.toLocaleString()}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
