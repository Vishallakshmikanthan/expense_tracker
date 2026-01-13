import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Wallet, TrendingDown } from 'lucide-react';

export default function Home() {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);
    const [budgetLimit, setBudgetLimit] = useState(0); // Aggregate or single? "Remaining budget" implies total.
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

            // 1. Fetch Expenses for this month
            const { data: expenses, error: expError } = await supabase
                .from('expenses')
                .select('*')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)
                .order('date', { ascending: false });

            if (expError) throw expError;

            const total = expenses.reduce((acc, item) => acc + item.amount, 0);
            setTotalSpent(total);
            setRecentExpenses(expenses.slice(0, 5));

            // 2. Fetch Budgets (Sum of all category budgets for this month)
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const { data: budgets, error: budError } = await supabase
                .from('budgets')
                .select('amount')
                .eq('month', currentMonthStr);

            if (budError) throw budError;

            const totalBudget = budgets.reduce((acc, item) => acc + item.amount, 0);
            setBudgetLimit(totalBudget);

        } catch (error) {
            console.error('Error loading dashboard:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const remaining = budgetLimit - totalSpent;
    const isOverBudget = remaining < 0;

    return (
        <div className="dashboard">
            <header className="app-header">
                <h1>Welcome, {user?.user_metadata?.username || 'User'}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/budgets" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'none', border: '1px solid #ddd', color: '#666' }}>Budgets</Link>
                    <Link to="/categories" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'none', border: '1px solid #ddd', color: '#666' }}>Categories</Link>
                    <Link to="/profile" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'none', border: '1px solid #ddd', color: '#666' }}>Profile</Link>
                    <button onClick={signOut} className="btn-logout" title="Sign Out"><LogOut size={20} /></button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue"><Wallet size={24} color="#fff" /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Spent</span>
                        <span className="stat-value">${totalSpent.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className={`stat-icon ${isOverBudget ? 'bg-red' : 'bg-green'}`}><TrendingDown size={24} color="#fff" /></div>
                    <div className="stat-info">
                        <span className="stat-label">Remaining Budget</span>
                        <span className={`stat-value ${isOverBudget ? 'text-red' : 'text-green'}`}>
                            ${remaining.toLocaleString()}
                        </span>
                        <span className="stat-sub">of ${budgetLimit.toLocaleString()} limit</span>
                    </div>
                </div>
            </div>

            <div className="section-header">
                <h2>Recent Expenses</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/expenses" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>See All</Link>
                    <Link to="/add" className="btn-fab"><Plus size={24} /></Link>
                </div>
            </div>

            <div className="expense-list">
                {loading ? (
                    <p>Loading...</p>
                ) : recentExpenses.length === 0 ? (
                    <p className="empty-state">No expenses this month.</p>
                ) : (
                    recentExpenses.map(item => (
                        <div key={item.id} className="expense-item">
                            <div className="expense-left">
                                <div className="category-tag">{item.category}</div>
                                <div>
                                    <div className="expense-note">{item.description || 'No description'}</div>
                                    <div className="expense-date">{new Date(item.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="expense-amount">-${item.amount}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
