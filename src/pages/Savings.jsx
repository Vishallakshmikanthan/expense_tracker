import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, TrendingDown, PiggyBank, IndianRupee, Plus, Target, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Savings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [savings, setSavings] = useState(0);
    const [goals, setGoals] = useState([]);

    // UI State
    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '' });
    const [editingGoal, setEditingGoal] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            // 1. Fetch Transactions (Existing Logic - UNTOUCHED)
            const { data: transactions, error } = await supabase
                .from('expenses')
                .select('amount, type')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

            if (error) throw error;

            let inc = 0;
            let exp = 0;

            transactions.forEach(t => {
                const type = t.type || 'expense';
                if (type === 'income') inc += t.amount;
                else exp += t.amount;
            });

            setIncome(inc);
            setExpense(exp);
            setSavings(inc - exp);

            // 2. Fetch Goals (New Feature)
            const { data: goalsData, error: goalsError } = await supabase
                .from('savings_goals')
                .select('*')
                .order('created_at', { ascending: true });

            if (goalsError) throw goalsError;
            setGoals(goalsData || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('savings_goals').insert({
                user_id: user.id,
                name: newGoal.name,
                target_amount: parseFloat(newGoal.target),
                current_amount: parseFloat(newGoal.current) || 0
            });
            if (error) throw error;
            setIsAddGoalOpen(false);
            setNewGoal({ name: '', target: '', current: '' });
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!confirm('Delete this savings goal?')) return;
        try {
            const { error } = await supabase.from('savings_goals').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleUpdateGoal = async (id, amount) => {
        try {
            const { error } = await supabase
                .from('savings_goals')
                .update({ current_amount: parseFloat(amount) })
                .eq('id', id);
            if (error) throw error;
            setEditingGoal(null);
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChevronLeft size={20} />
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Savings Hub</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Track Wealth & Goals</p>
                </div>
                <div style={{ width: 32 }}></div>
            </header>

            {/* Net Savings Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="stat-card"
                style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    padding: '2rem',
                    border: 'none',
                    marginBottom: '2.5rem',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                    <div>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>Net Monthly Savings</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={32} strokeWidth={2.5} /> {savings.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                        <PiggyBank size={32} color="white" />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', width: '100%', display: 'flex', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Income</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>+₹{income.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Expenses</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>-₹{expense.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Rate</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{savingsRate}%</div>
                    </div>
                </div>
            </motion.div>

            {/* Goals Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Your Goals</h3>
                <button onClick={() => setIsAddGoalOpen(true)} className="btn" style={{ background: 'var(--text-primary)', color: 'white' }}>
                    <Plus size={18} /> New Goal
                </button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: 0 }}>
                {goals.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                        <Target size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No goals yet</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Start saving for something special today.</p>
                    </div>
                ) : (
                    goals.map((goal) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        return (
                            <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ padding: '10px', background: '#F3E8FF', borderRadius: '10px', color: '#7C3AED' }}>
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{goal.name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target: ₹{goal.target_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="btn-secondary" style={{ padding: '6px', border: 'none' }}><Trash2 size={16} /></button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{goal.current_amount.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>saved</span>
                                </div>

                                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        style={{ height: '100%', background: '#8B5CF6', borderRadius: '4px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{progress.toFixed(0)}% Complete</span>
                                    <button
                                        onClick={() => {
                                            const add = prompt("Amount to add:");
                                            if (add) handleUpdateGoal(goal.id, goal.current_amount + parseFloat(add));
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        + Add Funds
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Add Goal Modal */}
            <AnimatePresence>
                {isAddGoalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="auth-card" style={{ maxWidth: '400px', margin: '1rem' }}
                        >
                            <h3 style={{ marginTop: 0 }}>Create Savings Goal</h3>
                            <form onSubmit={handleAddGoal}>
                                <div className="form-group">
                                    <label>Goal Name</label>
                                    <input required type="text" placeholder="e.g., New Laptop" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Target Amount (₹)</label>
                                    <input required type="number" placeholder="50000" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Initial Deposit (Optional)</label>
                                    <input type="number" placeholder="0" value={newGoal.current} onChange={e => setNewGoal({ ...newGoal, current: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setIsAddGoalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn" style={{ flex: 1 }}>Create Goal</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
