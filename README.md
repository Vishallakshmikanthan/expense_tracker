# 💰 Personal Finance Manager

A sophisticated, minimalist financial tracking application designed for personal wealth management. Built with a focus on data privacy, real-time synchronization, and a clean, content-first aesthetic inspired by modern productivity tools.



## 🌐 Live Demo
**[Launch Application](https://your-deployed-app.vercel.app)**  
*(Replace this link with your actual Vercel deployment URL)*

## ✨ Key Features

### 1. comprehensive Financial Tracking
- **Income & Expense Management**: Distinctly track cash inflows and outflows.
- **Real-Time Savings Analysis**: Auto-calculates your net savings and savings rate (%) instantly.
- **Categorization**: Organize finances with custom tags (e.g., *Salary, Rent, Investments*).

### 2. Smart Budgeting
- **Monthly Global Limits**: Set a hard cap on monthly spending to maintain financial discipline.
- **Granular Category Budgets**: Define specific limits for individual categories like 'Dining Out' or 'Entertainment'.
- **Visual Indicators**: Immediate visual feedback (Green/Red) when approaching or exceeding budget limits.

### 3. Sophisticated UI/UX
- **Notion-Inspired Design**: A distraction-free, minimalist interface using a neutral monochrome palette with purposeful color accents.
- **Motion Design**: Smooth, micro-interactions powered by `framer-motion` for a premium feel.
- **Responsive**: Fully optimized experience across Desktop, Tablet, and Mobile devices.

## 🛠️ Technical Architecture

This application utilizes a modern serverless architecture to ensure scalability and performance.

*   **Frontend**: React 18 (Vite)
*   **State Management**: React Context API
*   **Backend / Database**: Supabase (PostgreSQL)
*   **Authentication**: Supabase Auth (JWT with Row Level Security)
*   **Styling**: Uncompiled CSS Modules (Performance-first)
*   **Routing**: React Router v6

## 🔒 Security & Privacy

Privacy is a core tenet of this architecture.
*   **Row Level Security (RLS)**: Database policies strictly enforce that users can **only** access their own records. Data isolation is handled at the database engine level, not just the application layer.
*   **Secure Auth**: Authentication is handled via secure, HTTP-only flows.

## 🚀 Deployment Guide

This project is configured for one-click deployment on **Vercel**.

1.  **Fork/Clone** this repository.
2.  **Import** into Vercel.
3.  **Configure Environment Variables**:
    *   `VITE_SUPABASE_URL`: Your Supabase Project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Public API Key.
4.  **Deploy**.

---
*Developed by [Your Name]*
