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

    // Add Funds Modal State
    const [addFundsModal, setAddFundsModal] = useState({ isOpen: false, goalId: null, goalName: '', currentAmount: 0 });
    const [fundsToAdd, setFundsToAdd] = useState('');

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

    const openAddFundsModal = (goal) => {
        setAddFundsModal({
            isOpen: true,
            goalId: goal.id,
            goalName: goal.name,
            currentAmount: goal.current_amount
        });
        setFundsToAdd('');
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!fundsToAdd || parseFloat(fundsToAdd) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        const newAmount = addFundsModal.currentAmount + parseFloat(fundsToAdd);
        await handleUpdateGoal(addFundsModal.goalId, newAmount);
        setAddFundsModal({ isOpen: false, goalId: null, goalName: '', currentAmount: 0 });
        setFundsToAdd('');
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
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>Track Wealth & Goals</p>
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f1f5f9' }}>Your Goals</h3>
                <button onClick={() => setIsAddGoalOpen(true)} className="btn">
                    <Plus size={18} /> New Goal
                </button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: 0 }}>
                {goals.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
                        <Target size={48} color="rgba(255, 255, 255, 0.5)" style={{ marginBottom: '1rem' }} />
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#f1f5f9' }}>No goals yet</h4>
                        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>Start saving for something special today.</p>
                    </div>
                ) : (
                    goals.map((goal) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        return (
                            <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ padding: '10px', background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)', borderRadius: '10px', color: 'white' }}>
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f1f5f9' }}>{goal.name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Target: ₹{goal.target_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="btn-secondary" style={{ padding: '6px', border: 'none' }}><Trash2 size={16} /></button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>₹{goal.current_amount.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>saved</span>
                                </div>

                                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #a78bfa 0%, #c084fc 100%)', borderRadius: '4px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{progress.toFixed(0)}% Complete</span>
                                    <motion.button
                                        onClick={() => openAddFundsModal(goal)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            padding: '0.5rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        + Add Funds
                                    </motion.button>
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
                        onClick={() => setIsAddGoalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="auth-card" style={{ maxWidth: '400px', margin: '1rem' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>Create Savings Goal</h3>
                            <form onSubmit={handleAddGoal}>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Goal Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., New Laptop"
                                        value={newGoal.name}
                                        onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Target Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="50000"
                                        value={newGoal.target}
                                        onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Initial Deposit (Optional)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newGoal.current}
                                        onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setIsAddGoalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn" style={{ flex: 1 }}>Create Goal</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Funds Modal */}
            <AnimatePresence>
                {addFundsModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
                        onClick={() => setAddFundsModal({ isOpen: false, goalId: null, goalName: '', currentAmount: 0 })}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            className="auth-card"
                            style={{ maxWidth: '400px', margin: '1rem' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                                }}>
                                    <PiggyBank size={28} color="white" />
                                </div>
                                <h3 style={{ marginTop: 0, color: '#f1f5f9', marginBottom: '0.25rem' }}>Add Funds</h3>
                                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>{addFundsModal.goalName}</p>
                            </div>
                            <form onSubmit={handleAddFunds}>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Amount to Add (₹)</label>
                                    <div className="input-wrapper">
                                        <IndianRupee className="input-icon" size={20} />
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="Enter amount"
                                            value={fundsToAdd}
                                            onChange={e => setFundsToAdd(e.target.value)}
                                            className="premium-input"
                                            autoFocus
                                        />
                                    </div>
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        margin: '0.5rem 0 0 0'
                                    }}>
                                        Current: ₹{addFundsModal.currentAmount.toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setAddFundsModal({ isOpen: false, goalId: null, goalName: '', currentAmount: 0 })}
                                        className="btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        className="btn"
                                        style={{ flex: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Add Funds
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
