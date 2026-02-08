import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import EditExpense from './pages/EditExpense';
import Profile from './pages/Profile';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Savings from './pages/Savings';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder for Home/Dash until implemented

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/add" element={<AddExpense />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/edit/:id" element={<EditExpense />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/categories" element={<Categories />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
