# 💰 Expense Tracker Web App

A premium, full-stack Expense Tracker application built with **React (Vite)** and **Supabase**. Manage your personal finances with a clean, modern UI featuring glassmorphism and real-time data sync.

![Login Screen](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000) *(Replace with actual screenshot after deployment)*

## ✨ Features

- **🔐 Authentication**: Secure Email/Password login & signup (Supabase Auth).
- **📊 Dashboard**: Real-time overview of total spending and remaining monthly budget.
- **💸 Expense Management**:
  - Add expenses with dynamic categories.
  - Filter expenses by Month and Category.
  - Delete and Edit expenses.
- **📉 Budgeting**: Set monthly limits per category and track progress visually.
- **⚙️ Categories**: Manage custom categories to organize your spending.
- **📱 Responsive**: Optimized for both desktop and mobile web.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Styling**: CSS Modules / Native CSS Variables
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A Supabase Project

### 1. Clone the Repository
```bash
git clone https://github.com/Vishallakshmikanthan/expense_tracker.git
cd expense_tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```properties
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel.

1.  Push this code to your GitHub repository.
2.  Import the project into Vercel.
3.  Add the **Environment Variables** in Vercel Project Settings:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
4.  Deploy! 🚀

## 📂 Project Structure

```
src/
├── components/     # Reusable components (ProtectedRoute, etc.)
├── contexts/       # Global state (AuthContext)
├── lib/            # Supabase client configuration
├── pages/          # Application views (Home, Login, Expenses, etc.)
├── App.jsx         # Main routing logic
└── main.jsx        # Entry point
```

## 🔒 Security
- **Row Level Security (RLS)**: Users can only see and edit their own data.
- **Protected Routes**: Unauthenticated users are redirected to the Login page.

---
*Built as part of the Antigravity Project.*
