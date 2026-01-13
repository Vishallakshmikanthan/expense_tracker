import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, TrendingDown, PiggyBank, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Savings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [savings, setSavings] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            // Fetch transactions for this month with category info to determine type
            const { data: transactions, error } = await supabase
                .from('expenses')
                .select('amount, category')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

            if (error) throw error;

            // Note: 'expenses' table lacks 'type', so we must fetch all categories to map types
            const { data: categories } = await supabase.from('categories').select('name, type');

            // Map category name to type
            const catTypeMap = {};
            if (categories) {
                categories.forEach(c => catTypeMap[c.name] = c.type);
            }

            let inc = 0;
            let exp = 0;

            transactions.forEach(t => {
                const type = catTypeMap[t.category] || 'expense'; // Default to expense if not found
                if (type === 'income') inc += t.amount;
                else exp += t.amount;
            });

            setIncome(inc);
            setExpense(exp);
            setSavings(inc - exp);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
            <header className="app-header">
                <button onClick={() => navigate('/')} className="btn-logout" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> Home
                </button>
                <h2>Savings & Goals</h2>
                <div style={{ width: 32 }}></div>
            </header>

            <div style={{ padding: '0 1rem' }}>

                {/* Summary Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="stat-card"
                    style={{ flexDirection: 'column', alignItems: 'flex-start', background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', marginBottom: '2rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <PiggyBank size={32} color="white" />
                        <div>
                            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Net Savings (This Month)</span>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                <IndianRupee size={24} strokeWidth={3} /> {savings.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', width: '100%', display: 'flex', gap: '2rem' }}>
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

                {/* Placeholder for Goals Feature */}
                <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '3rem 1rem' }}>
                    <h3>Savings Goals</h3>
                    <p style={{ color: '#666' }}>Set targets for specific goals like "New Laptop", "Trip", etc.</p>
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.6, marginTop: '1rem' }}>Coming Soon</button>
                </div>

            </div>
        </motion.div>
    );
}
